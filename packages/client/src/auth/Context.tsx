import React, { createContext, useContext, useMemo } from 'react';
import {
  AuthProvider as OidcAuthProvider,
  useAuth as useOidcAuth
} from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

import { resolveAuthConfig } from './resolveAuthConfig';

export type AuthProfile = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
};

export type AuthContextValue = {
  isEnabled: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile?: AuthProfile;
  token?: string;
  login: (opts?: { redirectUri?: string }) => void;
  logout: (opts?: { redirectUri?: string }) => void;
};

const DisabledContext: AuthContextValue = {
  isEnabled: false,
  isLoading: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
};

const AuthContext = createContext<AuthContextValue>(DisabledContext);

const config = resolveAuthConfig({
  REACT_APP_OIDC_AUTHORITY: process.env.REACT_APP_OIDC_AUTHORITY,
  REACT_APP_OIDC_CLIENT_ID: process.env.REACT_APP_OIDC_CLIENT_ID,
  REACT_APP_KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL,
  REACT_APP_KEYCLOAK_REALM: process.env.REACT_APP_KEYCLOAK_REALM,
  REACT_APP_KEYCLOAK_CLIENT_ID: process.env.REACT_APP_KEYCLOAK_CLIENT_ID
});

function EnabledAuthBridge(props: { children: React.ReactNode }) {
  const oidc = useOidcAuth();

  const value = useMemo<AuthContextValue>(() => {
    const p = oidc.user?.profile;
    const profile: AuthProfile | undefined = p
      ? {
          username: p.preferred_username,
          email: p.email,
          firstName: p.given_name,
          lastName: p.family_name,
          emailVerified: p.email_verified
        }
      : undefined;

    return {
      isEnabled: true,
      isLoading: oidc.isLoading,
      isAuthenticated: !!oidc.isAuthenticated,
      profile,
      token: oidc.user?.access_token,
      login: (opts) =>
        oidc.signinRedirect({
          redirect_uri: opts?.redirectUri ?? window.location.href
        }),
      logout: (opts) =>
        oidc.signoutRedirect({
          post_logout_redirect_uri: opts?.redirectUri ?? window.location.href
        })
    };
  }, [oidc]);

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}

export function AuthProvider(props: { children: React.ReactNode }) {
  if (!config.isEnabled) {
    return (
      <AuthContext.Provider value={DisabledContext}>
        {props.children}
      </AuthContext.Provider>
    );
  }

  return (
    <OidcAuthProvider
      authority={config.authority}
      client_id={config.clientId}
      redirect_uri={window.location.origin + window.location.pathname}
      post_logout_redirect_uri={
        window.location.origin + window.location.pathname
      }
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={() => {
        // Remove code/state params from URL after successful login
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }}
    >
      <EnabledAuthBridge>{props.children}</EnabledAuthBridge>
    </OidcAuthProvider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
