import { GenericObject, ApiError } from '../types';

class Api {
  static fetch(url: string, options: GenericObject) {
    return fetch(url, options).then(async (response) => {
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
