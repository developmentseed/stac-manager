import { useCallback } from 'react';
import { useStacApiContext } from '@developmentseed/stac-react';

import { ApiError, GenericObject } from '../types';

export type { ApiError };

/**
 * Hook returning a fetcher that issues requests with the provider's
 * resolved auth headers and returns parsed JSON. Bypasses stac-react's
 * StacApi.fetch (which is shaped for STAC search payloads, not arbitrary
 * bodies) and uses the global fetch directly so callers can pass `body`,
 * `signal`, etc.
 *
 * Rejects with an ApiError on non-2xx, with the server's JSON body when
 * available, falling back to text.
 */
export function useStacFetchJson() {
  const { stacApi } = useStacApiContext();

  return useCallback(
    async <T = unknown>(url: string, init: RequestInit = {}): Promise<T> => {
      if (!stacApi) {
        throw new Error('StacApi not yet initialized');
      }

      const options: GenericObject | undefined =
        typeof stacApi.options === 'function'
          ? stacApi.options()
          : stacApi.options;

      const response = await fetch(url, {
        ...init,
        headers: {
          ...(options?.headers || {}),
          ...(init.headers || {})
        }
      });

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      const { status, statusText } = response;
      const e: ApiError = { status, statusText };
      const clone = response.clone();
      try {
        e.detail = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        e.detail = await clone.text();
      }
      throw e;
    },
    [stacApi]
  );
}
