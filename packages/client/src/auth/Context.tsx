import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

const url = process.env.REACT_APP_KEYCLOAK_URL;
const realm = process.env.REACT_APP_KEYCLOAK_REALM;
const clientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;

const isAuthEnabled = !!(url && realm && clientId);

const keycloak: KeycloakInstance | undefined = isAuthEnabled
  ? new (Keycloak as any)({
      url,
      realm,
      clientId
    })
  : undefined;

export type KeycloakContextProps = {
  initStatus: 'loading' | 'success' | 'error';
  isLoading: boolean;
  profile?: Keycloak.KeycloakProfile;
} & (
  | {
      keycloak: KeycloakInstance;
      isEnabled: true;
    }
  | {
      keycloak: undefined;
      isEnabled: false;
    }
);

const KeycloakContext = createContext<KeycloakContextProps>({
  initStatus: 'loading',
  isEnabled: isAuthEnabled
} as KeycloakContextProps);

export const KeycloakProvider = (props: { children: React.ReactNode }) => {
  const [initStatus, setInitStatus] =
    useState<KeycloakContextProps['initStatus']>('loading');
  const [profile, setProfile] = useState<
    Keycloak.KeycloakProfile | undefined
  >();

  const wasInit = useRef(false);

  useEffect(() => {
    async function initialize() {
      if (!keycloak) return;
      // Keycloak can only be initialized once. This is a workaround to avoid
      // multiple initialization attempts, specially by React double rendering.
      if (wasInit.current) return;
      wasInit.current = true;

      try {
        await keycloak.init({
          // onLoad: 'login-required',
          onLoad: 'check-sso',
          checkLoginIframe: false
        });
        if (keycloak.authenticated) {
          const profile =
            await (keycloak.loadUserProfile() as unknown as Promise<Keycloak.KeycloakProfile>);
          setProfile(profile);
        }

        setInitStatus('success');
      } catch (err) {
        setInitStatus('error');
        // eslint-disable-next-line no-console
        console.error('Failed to initialize keycloak adapter:', err);
      }
    }
    initialize();
  }, []);

  const base = {
    initStatus,
    isLoading: isAuthEnabled && initStatus === 'loading',
    profile
  };

  return (
    <KeycloakContext.Provider
      value={
        isAuthEnabled
          ? {
              ...base,
              keycloak: keycloak!,
              isEnabled: true
            }
          : {
              ...base,
              keycloak: undefined,
              isEnabled: false
            }
      }
    >
      {props.children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const ctx = useContext(KeycloakContext);

  if (!ctx) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }

  return ctx;
};
