import { createContext, useContext } from 'react';

import { GenericObject, ApiError } from '../types';

// Normalized STAC API base (no trailing slash) so callers can safely
// concatenate paths without producing `/stac//collections`.
export const STAC_API_URL: string | undefined =
  process.env.REACT_APP_STAC_API?.replace(/\/+$/, '');

class Api {
  private token: string | undefined;
  private stacBaseUrl: string | undefined;

  constructor(
    token: string | undefined,
    stacBaseUrl: string | undefined = STAC_API_URL
  ) {
    this.token = token;
    this.stacBaseUrl = stacBaseUrl;
  }

  private isStacUrl(url: string): boolean {
    if (!this.stacBaseUrl) return false;
    return url === this.stacBaseUrl || url.startsWith(`${this.stacBaseUrl}/`);
  }

  fetch(url: string, options: GenericObject = {}) {
    const injected =
      this.token && this.isStacUrl(url)
        ? { Authorization: `Bearer ${this.token}` }
        : {};

    const finalOptions: GenericObject = {
      ...options,
      headers: {
        ...injected,
        ...(options.headers || {})
      }
    };

    return fetch(url, finalOptions).then(async (response) => {
      if (response.ok) {
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
      return Promise.reject(e);
    });
  }
}

export const ApiContext = createContext<Api | null>(null);

export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within an ApiContext.Provider');
  }
  return api;
}

export default Api;
