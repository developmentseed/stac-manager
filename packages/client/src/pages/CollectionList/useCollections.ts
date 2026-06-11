/**
 * Why this file exists:
 * @developmentseed/stac-react does not allow to change the limit and offset of
 * the collections endpoint. This file is a temporary workaround to allow
 * pagination.
 *
 * Auth wiring is handled centrally by the StacApiAuthBridge in main.tsx, which
 * builds the authed `Api` instance exposed via ApiContext. This hook reads that
 * instance through useApi() rather than re-deriving an Authorization header
 * from useAuth().token — the two paths are then guaranteed to stay in sync.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { StacCollection, StacLink } from 'stac-ts';

import { useApi, STAC_API_URL } from '../../api';

type ApiError = {
  detail?: { [key: string]: any } | string;
  status: number;
  statusText: string;
};

type LoadingState = 'IDLE' | 'LOADING';

type ApiResponse = {
  collections: StacCollection[];
  links: StacLink[];
  numberMatched: number;
  numberReturned: number;
};

type StacCollectionsHook = {
  collections?: ApiResponse;
  reload: () => void;
  state: LoadingState;
  error?: ApiError;
  nextPage?: () => void;
  prevPage?: () => void;
  setOffset: (newOffset: number) => void;
};

export function useCollections(opts?: {
  limit?: number;
  initialOffset?: number;
}): StacCollectionsHook {
  const { limit = 10, initialOffset = 0 } = opts || {};

  const api = useApi();

  const [collections, setCollections] = useState<ApiResponse>();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const [offset, setOffset] = useState(initialOffset);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // One controller for whichever request is currently in flight — whether it
  // came from the effect below or from reload(). Starting a new request
  // aborts the previous one, so a slow response can never clobber a newer
  // one, and unmount cleanup aborts reloads too.
  const abortRef = useRef<AbortController | null>(null);

  const getCollections = useCallback(
    async (offset: number, limit: number) => {
      if (!STAC_API_URL) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      setState('LOADING');

      try {
        const data: ApiResponse = await api.fetch(
          `${STAC_API_URL}/collections?limit=${limit}&offset=${offset}`,
          { signal }
        );
        if (signal?.aborted) return;

        setHasNext(!!data.links.find((l) => l.rel === 'next'));
        setHasPrev(
          !!data.links.find((l) => ['prev', 'previous'].includes(l.rel))
        );

        setCollections(data);
        setError(undefined);
      } catch (err: any) {
        if (err?.name === 'AbortError' || signal?.aborted) return;
        setError(err);
        setCollections(undefined);
      } finally {
        if (!signal?.aborted) setState('IDLE');
      }
    },
    [api]
  );

  const nextPage = useCallback(() => {
    setOffset(offset + limit);
  }, [offset, limit]);

  const prevPage = useCallback(() => {
    setOffset(offset - limit);
  }, [offset, limit]);

  useEffect(() => {
    getCollections(offset, limit);
    return () => abortRef.current?.abort();
  }, [getCollections, offset, limit]);

  return {
    collections,
    reload: useCallback(
      () => getCollections(offset, limit),
      [getCollections, offset, limit]
    ),
    nextPage: hasNext ? nextPage : undefined,
    prevPage: hasPrev ? prevPage : undefined,
    setOffset,
    state,
    error
  };
}
