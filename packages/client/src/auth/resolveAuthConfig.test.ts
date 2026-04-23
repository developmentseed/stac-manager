import { resolveAuthConfig } from './resolveAuthConfig';

describe('resolveAuthConfig', () => {
  it('returns disabled when no env vars are set', () => {
    expect(resolveAuthConfig({})).toEqual({ isEnabled: false });
  });

  it('returns enabled when both OIDC vars are set', () => {
    const result = resolveAuthConfig({
      REACT_APP_OIDC_AUTHORITY: 'https://idp.example.com',
      REACT_APP_OIDC_CLIENT_ID: 'my-app'
    });
    expect(result).toEqual({
      isEnabled: true,
      authority: 'https://idp.example.com',
      clientId: 'my-app'
    });
  });

  it('returns disabled if only authority is set', () => {
    expect(
      resolveAuthConfig({
        REACT_APP_OIDC_AUTHORITY: 'https://idp.example.com'
      })
    ).toEqual({ isEnabled: false });
  });

  it('returns disabled if only clientId is set', () => {
    expect(
      resolveAuthConfig({
        REACT_APP_OIDC_CLIENT_ID: 'my-app'
      })
    ).toEqual({ isEnabled: false });
  });

  it('treats empty-string env values as absent', () => {
    expect(
      resolveAuthConfig({
        REACT_APP_OIDC_AUTHORITY: '',
        REACT_APP_OIDC_CLIENT_ID: ''
      })
    ).toEqual({ isEnabled: false });
  });
});
