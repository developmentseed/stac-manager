import { createContext, useContext } from 'react';

import { GenericObject, ApiError } from '../types';

// Normalized STAC API base (no trailing slash) so callers can safely
// concatenate paths without producing `/stac//collections`.
export const STAC_API_URL: string | undefined =
  process.env.REACT_APP_STAC_API?.replace(/\/+$/, '');

// Authed fetcher for direct (non-stac-react) calls to the STAC API — used by
// mutations (PUT/POST/DELETE) and any reads outside the stac-react hook tree.
// Each instance is immutable; the bridge constructs a new one when the token
// changes, which propagates to consumers via ApiContext.
class Api {
  private token: string | undefined;
  private stacBaseUrl: string | undefined;
  private refreshAuth?: () => Promise<string | undefined>;

  constructor(
    token: string | undefined,
    stacBaseUrl: string | undefined = STAC_API_URL,
    refreshAuth?: () => Promise<string | undefined>
  ) {
    this.token = token;
    this.stacBaseUrl = stacBaseUrl;
    this.refreshAuth = refreshAuth;
  }

  // Scope guard: only attach Authorization for URLs under the configured STAC
  // base. Prevents leaking the bearer to OIDC discovery, static assets, or
  // unrelated third-party origins. Path-boundary check ensures `/stac-admin`
  // does not match a `/stac` base.
  private isStacUrl(url: string): boolean {
    if (!this.stacBaseUrl) return false;
    return url === this.stacBaseUrl || url.startsWith(`${this.stacBaseUrl}/`);
  }

  // Build the final fetch options, injecting the Authorization header for
  // STAC-scoped URLs. `tokenOverride` lets the 401-retry path swap in a
  // freshly-refreshed token without rebuilding the instance.
  private buildOptions(
    url: string,
    options: GenericObject,
    tokenOverride?: string
  ): GenericObject {
    const t = tokenOverride ?? this.token;
    const injected =
      t && this.isStacUrl(url) ? { Authorization: `Bearer ${t}` } : {};
    // Caller-provided headers win on collision, so a caller can override the
    // injected Authorization (e.g. force an explicit anonymous request).
    return {
      ...options,
      headers: {
        ...injected,
        ...(options.headers || {})
      }
    };
  }

  async fetch(url: string, options: GenericObject = {}) {
    let response = await fetch(url, this.buildOptions(url, options));

    // Self-heal a single 401 on a STAC-authed request: refresh the access
    // token via the OIDC client and retry once with the new bearer. Guards
    // against infinite loops by only retrying when a refresh callback is
    // wired and the original request was for a STAC URL with a token.
    if (
      response.status === 401 &&
      this.refreshAuth &&
      this.token &&
      this.isStacUrl(url)
    ) {
      const fresh = await this.refreshAuth();
      if (fresh && fresh !== this.token) {
        response = await fetch(url, this.buildOptions(url, options, fresh));
      }
    }

    if (response.ok) {
      // 204 No Content has no body; calling .json() on it would throw a
      // parse error. Return undefined for empty-body responses so callers
      // that issue PUT/DELETE against STAC APIs don't have to unwrap.
      if (response.status === 204) return undefined;
      return response.json();
    }

    const { status, statusText } = response;
    const e: ApiError = {
      status,
      statusText
    };
    // Some STAC APIs return errors as JSON others as string.
    // Clone the response so we can read the body as text if json fails.
    const clone = response.clone();
    try {
      e.detail = await response.json();
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    } catch (err) {
      e.detail = await clone.text();
    }
    throw e;
  }
}

// Context carrying the currently-authed Api instance. The bridge in main.tsx
// is the only producer; consumers read via useApi().
export const ApiContext = createContext<Api | null>(null);

// Hook for components and custom hooks that need to issue direct STAC API
// calls. Throws if used outside the bridge — that's a wiring bug, not a
// runtime condition worth handling gracefully.
export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within an ApiContext.Provider');
  }
  return api;
}

export default Api;
