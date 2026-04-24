/**
 * @jest-environment node
 */
import Api, { setApiAuthToken } from './index';

const STAC_API = process.env.REACT_APP_STAC_API!;

describe('Api.fetch auth injection', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    setApiAuthToken(undefined);
  });

  it('adds Authorization when token is set and URL is under the STAC API base', async () => {
    setApiAuthToken('abc123');

    await Api.fetch(`${STAC_API}/collections/foo`, { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc123' });
  });

  it('omits Authorization when token is absent', async () => {
    setApiAuthToken(undefined);

    await Api.fetch(`${STAC_API}/collections/foo`, { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });

  it('omits Authorization for URLs outside the STAC API base', async () => {
    setApiAuthToken('abc123');

    await Api.fetch('https://other.example.com/foo', { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });

  it('lets caller headers override the injected Authorization', async () => {
    setApiAuthToken('abc123');

    await Api.fetch(`${STAC_API}/collections/foo`, {
      method: 'GET',
      headers: { Authorization: 'Bearer override' }
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer override' });
  });

  it('omits Authorization when REACT_APP_STAC_API is unset', async () => {
    const original = process.env.REACT_APP_STAC_API;
    delete process.env.REACT_APP_STAC_API;
    setApiAuthToken('abc123');

    try {
      await Api.fetch('https://fake-stac-api.net/collections/foo', {
        method: 'GET'
      });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.headers || {}).not.toHaveProperty('Authorization');
    } finally {
      process.env.REACT_APP_STAC_API = original;
    }
  });
});
