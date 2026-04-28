import { GenericObject, ApiError } from '../types';

let authToken: string | undefined;

export function setApiAuthToken(token: string | undefined) {
  authToken = token;
}

// Normalized STAC API base (no trailing slash) so callers can safely
// concatenate paths without producing `/stac//collections`.
export const STAC_API_URL: string | undefined =
  process.env.REACT_APP_STAC_API?.replace(/\/+$/, '');

function isStacApiUrl(url: string): boolean {
  if (!STAC_API_URL) return false;
  return url === STAC_API_URL || url.startsWith(`${STAC_API_URL}/`);
}

class Api {
  static fetch(url: string, options: GenericObject = {}) {
    const injected =
      authToken && isStacApiUrl(url)
        ? { Authorization: `Bearer ${authToken}` }
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

export default Api;
