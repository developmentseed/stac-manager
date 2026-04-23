import { resolveAuthConfig } from './resolveAuthConfig';

describe('resolveAuthConfig', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns disabled when no env vars are set', () => {
    const result = resolveAuthConfig({});
    expect(result).toEqual({ isEnabled: false });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('prefers new OIDC vars when both are set', () => {
    const result = resolveAuthConfig({
      REACT_APP_OIDC_AUTHORITY: 'https://idp.example.com',
      REACT_APP_OIDC_CLIENT_ID: 'my-app',
      REACT_APP_KEYCLOAK_URL: 'https://legacy.example.com',
      REACT_APP_KEYCLOAK_REALM: 'legacy',
      REACT_APP_KEYCLOAK_CLIENT_ID: 'legacy-app'
    });
    expect(result).toEqual({
      isEnabled: true,
      authority: 'https://idp.example.com',
      clientId: 'my-app'
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('derives authority from keycloak vars and warns', () => {
    const result = resolveAuthConfig({
      REACT_APP_KEYCLOAK_URL: 'https://iam.example.com',
      REACT_APP_KEYCLOAK_REALM: 'eoepca',
      REACT_APP_KEYCLOAK_CLIENT_ID: 'eoapi'
    });
    expect(result).toEqual({
      isEnabled: true,
      authority: 'https://iam.example.com/realms/eoepca',
      clientId: 'eoapi'
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(
      /REACT_APP_KEYCLOAK_\*.+deprecated/i
    );
  });

  it('strips trailing slash from KEYCLOAK_URL when deriving authority', () => {
    const result = resolveAuthConfig({
      REACT_APP_KEYCLOAK_URL: 'https://iam.example.com/',
      REACT_APP_KEYCLOAK_REALM: 'eoepca',
      REACT_APP_KEYCLOAK_CLIENT_ID: 'eoapi'
    });
    expect(result).toEqual({
      isEnabled: true,
      authority: 'https://iam.example.com/realms/eoepca',
      clientId: 'eoapi'
    });
  });

  it('returns disabled if keycloak vars are partial', () => {
    const result = resolveAuthConfig({
      REACT_APP_KEYCLOAK_URL: 'https://iam.example.com',
      REACT_APP_KEYCLOAK_CLIENT_ID: 'eoapi'
      // no realm
    });
    expect(result).toEqual({ isEnabled: false });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns disabled if OIDC vars are partial', () => {
    const result = resolveAuthConfig({
      REACT_APP_OIDC_AUTHORITY: 'https://idp.example.com'
      // no client id
    });
    expect(result).toEqual({ isEnabled: false });
  });

  it('treats empty-string env values as absent', () => {
    const result = resolveAuthConfig({
      REACT_APP_OIDC_AUTHORITY: '',
      REACT_APP_OIDC_CLIENT_ID: '',
      REACT_APP_KEYCLOAK_URL: 'https://iam.example.com',
      REACT_APP_KEYCLOAK_REALM: 'eoepca',
      REACT_APP_KEYCLOAK_CLIENT_ID: 'eoapi'
    });
    // Empty OIDC vars should NOT block the legacy fallback
    expect(result).toEqual({
      isEnabled: true,
      authority: 'https://iam.example.com/realms/eoepca',
      clientId: 'eoapi'
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
