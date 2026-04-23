export type AuthConfig =
  | { isEnabled: false }
  | { isEnabled: true; authority: string; clientId: string };

type EnvShape = {
  REACT_APP_OIDC_AUTHORITY?: string;
  REACT_APP_OIDC_CLIENT_ID?: string;
};

export function resolveAuthConfig(env: EnvShape): AuthConfig {
  const authority = env.REACT_APP_OIDC_AUTHORITY;
  const clientId = env.REACT_APP_OIDC_CLIENT_ID;

  if (authority && clientId) {
    return { isEnabled: true, authority, clientId };
  }

  return { isEnabled: false };
}
