/**
 * Why this file exists:
 * @developmentseed/stac-react does not allow to change the limit and offset of
 * the collections endpoint. This file is a temporary workaround to allow
 * pagination.
 */

import { useStacApi } from '@developmentseed/stac-react';
import { useCallback, useEffect, useState } from 'react';
import { StacCollection, StacLink } from 'stac-ts';

type ApiError = {
  detail?: { [key: string]: any } | string;
  status: number;
  statusText: string;
};

type LoadingState = 'IDLE' | 'LOADING';

const debounce = <F extends (...args: any) => any>(fn: F, ms = 250) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

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

  const { stacApi } = useStacApi(process.env.REACT_APP_STAC_API!);

  const [collections, setCollections] = useState<ApiResponse>();
  const [state, setState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<ApiError>();

  const [offset, setOffset] = useState(initialOffset);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const _getCollections = useCallback(
    async (offset: number, limit: number) => {
      if (stacApi) {
        setState('LOADING');

        try {
          const res = await stacApi.fetch(
            `${stacApi.baseUrl}/collections?limit=${limit}&offset=${offset}`
          );
          const data: ApiResponse = await res.json();

          setHasNext(!!data.links.find((l) => l.rel === 'next'));
          setHasPrev(
            !!data.links.find((l) => ['prev', 'previous'].includes(l.rel))
          );

          setCollections(data);
        } catch (err: any) {
          setError(err);
          setCollections(undefined);
        } finally {
          setState('IDLE');
        }
      }
    },
    [stacApi]
  );

  const getCollections = useCallback(
    (offset: number, limit: number) =>
      debounce(() => _getCollections(offset, limit))(),
    [_getCollections]
  );

  const nextPage = useCallback(() => {
    setOffset(offset + limit);
  }, [offset, limit]);

  const prevPage = useCallback(() => {
    setOffset(offset - limit);
  }, [offset, limit]);

  useEffect(() => {
    if (stacApi && !error && !collections) {
      getCollections(offset, limit);
    }
  }, [getCollections, stacApi, collections, error, offset, limit]);

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
