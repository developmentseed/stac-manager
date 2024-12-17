import { useCallback, useState } from 'react';
import { StacCollection } from 'stac-ts';
import Api from '../../api';
import { LoadingState, ApiError } from '../../types';

type UseCollectionTransactionType = {
  update: (id: string, data: StacCollection) => Promise<StacCollection>;
  create: (data: StacCollection) => Promise<StacCollection>;
  error?: ApiError;
  state: LoadingState;
};

export function useCollectionTransaction(): UseCollectionTransactionType {
  const [error, setError] = useState<ApiError>();
  const [state, setState] = useState<LoadingState>('IDLE');

  const createRequest = useCallback(
    async (url: string, method: string, data: StacCollection) => {
      setState('LOADING');

      try {
        return Api.fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (error) {
        setError(error as ApiError);
      } finally {
        setState('IDLE');
      }
    },
    []
  );

  return {
    update: (id: string, data: StacCollection) =>
      createRequest(
        `${process.env.REACT_APP_STAC_API}/collections/${id}`,
        'PUT',
        data
      ),
    create: (data: StacCollection) =>
      createRequest(
        `${process.env.REACT_APP_STAC_API}/collections/`,
        'POST',
        data
      ),
    error,
    state
  };
}
