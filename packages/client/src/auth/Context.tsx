import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  AuthProvider as OidcAuthProvider,
  useAuth as useOidcAuth
} from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

// Trigger a silent renewal this many seconds before the access token expires.
// Matches oidc-client-ts's default; restated here so the visibility-change
// top-up uses the same threshold.
const REFRESH_THRESHOLD_SECONDS = 60;

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
  /**
   * Force a silent refresh and return the new access token. Used by the API
   * layer to self-heal a 401 caused by a stale token. Resolves to undefined
   * if auth is disabled, the user isn't signed in, or the refresh fails.
   */
  refreshAuth: () => Promise<string | undefined>;
};

const DisabledContext: AuthContextValue = {
  isEnabled: false,
  isLoading: false,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refreshAuth: () => Promise.resolve(undefined)
};

const AuthContext = createContext<AuthContextValue>(DisabledContext);

const config: { authority: string; clientId: string } | undefined =
  process.env.REACT_APP_OIDC_AUTHORITY && process.env.REACT_APP_OIDC_CLIENT_ID
    ? {
        authority: process.env.REACT_APP_OIDC_AUTHORITY,
        clientId: process.env.REACT_APP_OIDC_CLIENT_ID
      }
    : undefined;

function EnabledAuthBridge(props: { children: React.ReactNode }) {
  const oidc = useOidcAuth();

  // Top up the access token whenever the tab comes back from hibernation.
  // automaticSilentRenew uses setTimeout, which browsers can throttle or
  // skip entirely while the tab is hidden — so a token that "should" have
  // refreshed in the background may be expired when the user returns.
  useEffect(() => {
    if (!oidc.isAuthenticated) return;

    const maybeRefresh = () => {
      if (document.visibilityState !== 'visible') return;
      const expiresAt = oidc.user?.expires_at; // seconds since epoch
      if (!expiresAt) return;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt - now > REFRESH_THRESHOLD_SECONDS) return;
      // Token is expired or expiring soon — refresh now.
      oidc.signinSilent().catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Silent token refresh on visibility change failed:', err);
      });
    };

    document.addEventListener('visibilitychange', maybeRefresh);
    return () => {
      document.removeEventListener('visibilitychange', maybeRefresh);
    };
  }, [oidc]);

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
        }),
      refreshAuth: async () => {
        try {
          const user = await oidc.signinSilent();
          return user?.access_token;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('Silent token refresh failed:', err);
          return undefined;
        }
      }
    };
  }, [oidc]);

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}

export function AuthProvider(props: { children: React.ReactNode }) {
  if (!config) {
    // eslint-disable-next-line no-console
    console.debug(
      'OIDC config not found, authentication disabled. To enable, set REACT_APP_OIDC_AUTHORITY and REACT_APP_OIDC_CLIENT_ID environment variables.'
    );
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
      // `offline_access` asks the IdP for a refresh token. Without it most
      // providers issue access-token-only sessions, and oidc-client-ts falls
      // back to iframe-based silent renewal — which is unreliable under
      // modern third-party-cookie restrictions. With a refresh token, silent
      // renewal uses the refresh_token grant and just works.
      scope='openid profile email offline_access'
      automaticSilentRenew={true}
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
