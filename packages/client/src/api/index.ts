import { GenericObject, ApiError } from '../types';

let authToken: string | undefined;

export function setApiAuthToken(token: string | undefined) {
  authToken = token;
}

function isStacApiUrl(url: string): boolean {
  const base = process.env.REACT_APP_STAC_API;
  return !!base && url.startsWith(base);
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
