/**
 * @jest-environment node
 */
import Api from './index';

const STAC_BASE = 'https://stac.example.com';

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
  });

  it('adds Authorization when token is set and URL is under the STAC API base', async () => {
    const api = new Api('abc123', STAC_BASE);

    await api.fetch(`${STAC_BASE}/collections/foo`, { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc123' });
  });

  it('omits Authorization when token is absent', async () => {
    const api = new Api(undefined, STAC_BASE);

    await api.fetch(`${STAC_BASE}/collections/foo`, { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });

  it('omits Authorization for URLs outside the STAC API base', async () => {
    const api = new Api('abc123', STAC_BASE);

    await api.fetch('https://other.example.com/foo', { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });

  it('lets caller headers override the injected Authorization', async () => {
    const api = new Api('abc123', STAC_BASE);

    await api.fetch(`${STAC_BASE}/collections/foo`, {
      method: 'GET',
      headers: { Authorization: 'Bearer override' }
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer override' });
  });

  it('omits Authorization when no STAC base URL is configured', async () => {
    const api = new Api('abc123', undefined);

    await api.fetch(`${STAC_BASE}/collections/foo`, { method: 'GET' });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });

  it('does not match sibling paths (e.g. /stac-admin against /stac)', async () => {
    const api = new Api('abc123', 'https://stac.example.com/stac');

    await api.fetch('https://stac.example.com/stac-admin/collections', {
      method: 'GET'
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers || {}).not.toHaveProperty('Authorization');
  });
});
