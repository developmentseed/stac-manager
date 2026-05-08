import React, { createContext, useContext, useEffect, useMemo } from 'react';
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
  login: (opts?: { redirectUri?: string }) => Promise<void>;
  logout: (opts?: { redirectUri?: string }) => Promise<void>;
};

const DisabledContext: AuthContextValue = {
  isEnabled: false,
  isLoading: false,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
};

const AuthContext = createContext<AuthContextValue>(DisabledContext);

const config = resolveAuthConfig({
  REACT_APP_OIDC_AUTHORITY: process.env.REACT_APP_OIDC_AUTHORITY,
  REACT_APP_OIDC_CLIENT_ID: process.env.REACT_APP_OIDC_CLIENT_ID
});

function EnabledAuthBridge(props: { children: React.ReactNode }) {
  const oidc = useOidcAuth();

  // Timer-based silent renewal does not fire while the tab is suspended
  // (laptop closed, backgrounded), so the access token can be expired by
  // the time the user returns. On visibility change, renew only if the
  // current token is actually expired so we don't hammer the IdP on every
  // tab focus.
  useEffect(() => {
    if (!oidc.isAuthenticated) {
      console.debug('[auth] user not authenticated, skipping...');
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const expiresIn = oidc.user?.expires_in;
      const expired = oidc.user?.expired;
      console.debug(
        '[auth] visibilitychange: expired=%s expires_in=%ss',
        expired,
        expiresIn
      );
      if (!expired) return;
      console.debug('[auth] token expired, calling signinSilent');
      oidc
        .signinSilent()
        .then((user) => {
          console.debug(
            '[auth] signinSilent ok, new expires_in=%ss',
            user?.expires_in
          );
        })
        .catch((err) => {
          // If silent renew fails, the next API call's 401 surfaces re-auth.
          console.debug('[auth] signinSilent failed', err);
        });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [oidc.isAuthenticated, oidc.signinSilent, oidc.user]);

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
      // offline_access requests a refresh_token so signinSilent() can renew
      // via the refresh grant instead of relying on a hidden-iframe session
      // check at the IdP (which is fragile under third-party-cookie policies).
      scope='openid offline_access'
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
