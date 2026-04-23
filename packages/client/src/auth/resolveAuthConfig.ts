export type AuthConfig =
  | { isEnabled: false }
  | { isEnabled: true; authority: string; clientId: string };

type EnvShape = {
  REACT_APP_OIDC_AUTHORITY?: string;
  REACT_APP_OIDC_CLIENT_ID?: string;
  REACT_APP_KEYCLOAK_URL?: string;
  REACT_APP_KEYCLOAK_REALM?: string;
  REACT_APP_KEYCLOAK_CLIENT_ID?: string;
};

const DEPRECATION_MESSAGE =
  '[stac-manager] REACT_APP_KEYCLOAK_* env vars are deprecated. ' +
  'Migrate to REACT_APP_OIDC_AUTHORITY (= "<keycloak-url>/realms/<realm>") ' +
  'and REACT_APP_OIDC_CLIENT_ID. See packages/client/README.md for details.';

export function resolveAuthConfig(env: EnvShape): AuthConfig {
  const oidcAuthority = env.REACT_APP_OIDC_AUTHORITY;
  const oidcClientId = env.REACT_APP_OIDC_CLIENT_ID;

  if (oidcAuthority && oidcClientId) {
    return {
      isEnabled: true,
      authority: oidcAuthority,
      clientId: oidcClientId
    };
  }

  const kcUrl = env.REACT_APP_KEYCLOAK_URL;
  const kcRealm = env.REACT_APP_KEYCLOAK_REALM;
  const kcClientId = env.REACT_APP_KEYCLOAK_CLIENT_ID;

  if (kcUrl && kcRealm && kcClientId) {
    // eslint-disable-next-line no-console
    console.warn(DEPRECATION_MESSAGE);
    const base = kcUrl.replace(/\/$/, '');
    return {
      isEnabled: true,
      authority: `${base}/realms/${kcRealm}`,
      clientId: kcClientId
    };
  }

  return { isEnabled: false };
}
