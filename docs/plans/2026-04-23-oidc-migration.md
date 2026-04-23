# Generic OIDC Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `keycloak-js` with a standards-based OIDC client (`react-oidc-context` + `oidc-client-ts`) so the app works with any OIDC IdP (Keycloak, Auth0, Cognito, Okta, Entra, Google, …), and introduce new `REACT_APP_OIDC_*` env vars. Keep the old `REACT_APP_KEYCLOAK_*` vars working via a deprecation shim that logs a console warning.

**Architecture:**
- A single code path uses `react-oidc-context`. `keycloak-js` is removed.
- A pure `resolveAuthConfig()` function reads env vars in precedence order: new `REACT_APP_OIDC_*` first, then shim from `REACT_APP_KEYCLOAK_*` (derives `authority = ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`), with a `console.warn` deprecation message on the shim path.
- The existing `useKeycloak()` hook is replaced with a generic `useAuth()` hook whose shape matches current call-site usage (`isEnabled`, `isLoading`, `isAuthenticated`, `profile`, `token`, `login`, `logout`). Profile comes from the parsed ID token — no more `/account` CORS call.
- Helm chart and Docker entrypoint emit the new env vars; Helm `values.yaml` accepts both `oidc.authority` (new) and the existing `oidc.providerUrl` + `oidc.realm` (deprecated but still supported).

**Tech Stack:** React 18, `react-oidc-context` ^3, `oidc-client-ts` ^3, Jest + React Testing Library (already present).

**References in code audited before planning:**
- `packages/client/src/auth/Context.tsx` — current provider
- `packages/client/src/components/auth/{UserInfo,RequireAuth,ButtonWithAuth,MenuItemWithAuth}.tsx` — call sites
- `packages/client/src/components/MainNavigation.tsx` — call site
- `packages/client/src/pages/CollectionForm/index.tsx` — uses `keycloak.token`
- `packages/client/src/App.tsx`, `packages/client/src/main.tsx` — provider mount + `isLoading` gate
- `packages/client/.env.example`, `.env`
- `docker-entrypoint.sh`
- `charts/stac-manager/templates/deployment.yaml`, `charts/stac-manager/values.yaml`
- `packages/client/README.md`, root `README.md`

---

### Task 1: Install dependencies, remove keycloak-js

**Files:**
- Modify: `packages/client/package.json`

**Step 1: Edit `packages/client/package.json` dependencies**

Remove:
```json
"keycloak-js": "^26.1.4",
```

Add (keep alphabetical order in the dependencies block):
```json
"oidc-client-ts": "^3.0.1",
"react-oidc-context": "^3.1.1",
```

**Step 2: Run install at repo root**

Run: `npm install`

Expected: install completes; `package-lock.json` updates; `keycloak-js` is gone from `node_modules/`, `react-oidc-context` + `oidc-client-ts` are present.

**Step 3: Verify nothing else imports `keycloak-js`**

Run: `grep -R "keycloak-js" packages/ --include='*.ts' --include='*.tsx'`

Expected: only matches are inside `packages/client/src/auth/Context.tsx` (will be rewritten in Task 3).

**Step 4: Commit**

```bash
git add packages/client/package.json package-lock.json
git commit -m "chore: swap keycloak-js for react-oidc-context"
```

---

### Task 2: Add a pure `resolveAuthConfig()` helper with tests

Extract env var resolution into a pure function so the precedence rules and deprecation warning are testable without rendering React.

**Files:**
- Create: `packages/client/src/auth/resolveAuthConfig.ts`
- Create: `packages/client/src/auth/resolveAuthConfig.test.ts`

**Step 1: Write the failing tests**

Create `packages/client/src/auth/resolveAuthConfig.test.ts`:

```ts
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
    expect(warnSpy.mock.calls[0][0]).toMatch(/REACT_APP_KEYCLOAK_\*.+deprecated/i);
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
});
```

**Step 2: Run the tests to confirm they fail**

Run: `cd packages/client && npx jest src/auth/resolveAuthConfig.test.ts`

Expected: FAIL — `Cannot find module './resolveAuthConfig'`.

**Step 3: Implement `resolveAuthConfig.ts`**

Create `packages/client/src/auth/resolveAuthConfig.ts`:

```ts
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
    return { isEnabled: true, authority: oidcAuthority, clientId: oidcClientId };
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
```

**Step 4: Run the tests to confirm they pass**

Run: `cd packages/client && npx jest src/auth/resolveAuthConfig.test.ts`

Expected: All 6 tests PASS.

**Step 5: Commit**

```bash
git add packages/client/src/auth/resolveAuthConfig.ts packages/client/src/auth/resolveAuthConfig.test.ts
git commit -m "feat(auth): add resolveAuthConfig with keycloak env shim"
```

---

### Task 3: Rewrite `auth/Context.tsx` around `react-oidc-context`

Replace the keycloak-js-based provider with a thin wrapper over `react-oidc-context`. Keep an "auth disabled" branch that renders children without any provider when no env vars are set. Expose a `useAuth()` hook whose shape mirrors the existing `useKeycloak()` return enough to minimize call-site churn.

**Files:**
- Modify: `packages/client/src/auth/Context.tsx`

**Step 1: Replace the file contents**

```tsx
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

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
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
      post_logout_redirect_uri={window.location.origin + window.location.pathname}
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={() => {
        // Remove code/state params from URL after successful login
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
    >
      <EnabledAuthBridge>{props.children}</EnabledAuthBridge>
    </OidcAuthProvider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
```

**Step 2: Typecheck**

Run: `cd packages/client && npm run ts-check`

Expected: PASS (no new type errors introduced by this file; call-sites will still fail typecheck until Task 4).

Note: call-sites still import `useKeycloak`; those errors are expected and will be fixed in Task 4. If the typecheck blocks on them, skip this step and run it again at the end of Task 4.

**Step 3: Commit**

```bash
git add packages/client/src/auth/Context.tsx
git commit -m "feat(auth): replace keycloak-js provider with react-oidc-context"
```

---

### Task 4: Update call-sites to use `useAuth()`

All five files that currently import `useKeycloak` need updating. Work through them in this order and commit each file individually so the diffs stay small.

#### Task 4a: `main.tsx`

**Files:**
- Modify: `packages/client/src/main.tsx`

**Step 1: Edit imports and provider**

Replace:
```tsx
import { KeycloakProvider } from './auth/Context';
```
With:
```tsx
import { AuthProvider } from './auth/Context';
```

Replace `<KeycloakProvider>…</KeycloakProvider>` with `<AuthProvider>…</AuthProvider>`.

**Step 2: Commit**

```bash
git add packages/client/src/main.tsx
git commit -m "refactor(auth): use AuthProvider in main"
```

#### Task 4b: `App.tsx`

**Files:**
- Modify: `packages/client/src/App.tsx`

**Step 1: Swap the hook**

Replace:
```tsx
import { useKeycloak } from './auth/Context';
// ...
const { isLoading } = useKeycloak();
```
With:
```tsx
import { useAuth } from './auth/Context';
// ...
const { isLoading } = useAuth();
```

**Step 2: Commit**

```bash
git add packages/client/src/App.tsx
git commit -m "refactor(auth): use useAuth in App"
```

#### Task 4c: `UserInfo.tsx`

**Files:**
- Modify: `packages/client/src/components/auth/UserInfo.tsx`

**Step 1: Swap the hook and login/logout calls**

- Change `import { useKeycloak } from 'src/auth/Context';` → `import { useAuth } from 'src/auth/Context';`
- Change `const { profile, isLoading, isEnabled, keycloak } = useKeycloak();` → `const { profile, isLoading, isEnabled, isAuthenticated, login, logout } = useAuth();`
- Change `const isAuthenticated = keycloak.authenticated;` → delete this line (now destructured).
- Change `keycloak.login({ redirectUri: window.location.href })` → `login({ redirectUri: window.location.href })`
- Change `keycloak.logout({ redirectUri: window.location.href })` → `logout({ redirectUri: window.location.href })`

**Step 2: Commit**

```bash
git add packages/client/src/components/auth/UserInfo.tsx
git commit -m "refactor(auth): use useAuth in UserInfo"
```

#### Task 4d: `RequireAuth.tsx`

**Files:**
- Modify: `packages/client/src/components/auth/RequireAuth.tsx`

**Step 1: Swap the hook**

Replace the body with:

```tsx
import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';

import { InnerPageHeader } from '$components/InnerPageHeader';
import usePageTitle from '$hooks/usePageTitle';
import { useAuth } from 'src/auth/Context';

export function RequireAuth(
  props: {
    Component: React.ElementType;
  } & Record<string, any>
) {
  const { Component, ...rest } = props;
  usePageTitle('Authentication Required');

  const auth = useAuth();

  if (!auth.isEnabled) {
    return <Component {...rest} />;
  }

  if (auth.isAuthenticated) {
    return <Component {...rest} />;
  }

  return (
    <Flex direction='column' gap={4}>
      <InnerPageHeader title='Authentication Required' overline='Oops' />
      <Flex direction='column' gap={2} p={4}>
        <Text>You need to login to access this content.</Text>
        <Button
          alignSelf='flex-start'
          variant='solid'
          colorScheme='primary'
          onClick={() => auth.login({ redirectUri: window.location.href })}
        >
          Login
        </Button>
      </Flex>
    </Flex>
  );
}
```

**Step 2: Commit**

```bash
git add packages/client/src/components/auth/RequireAuth.tsx
git commit -m "refactor(auth): use useAuth in RequireAuth"
```

#### Task 4e: `ButtonWithAuth.tsx` and `MenuItemWithAuth.tsx`

**Files:**
- Modify: `packages/client/src/components/auth/ButtonWithAuth.tsx`
- Modify: `packages/client/src/components/auth/MenuItemWithAuth.tsx`

**Step 1: ButtonWithAuth.tsx — swap hook and `keycloak.authenticated` → `isAuthenticated`**

```tsx
import React from 'react';
import { Button, ButtonProps, forwardRef } from '@chakra-ui/react';
import SmartLink, { SmartLinkProps } from '../SmartLink';
import { useAuth } from 'src/auth/Context';

export const ButtonWithAuth = forwardRef<
  SmartLinkProps & ButtonProps,
  typeof Button
>((props, ref) => {
  const { isEnabled, isAuthenticated } = useAuth();

  if (!isEnabled) {
    return <Button ref={ref} as={SmartLink} {...props} />;
  }

  return isAuthenticated && <Button ref={ref} as={SmartLink} {...props} />;
});
```

**Step 2: MenuItemWithAuth.tsx — same treatment**

```tsx
import React from 'react';
import { forwardRef, MenuItem, MenuItemProps } from '@chakra-ui/react';
import { useAuth } from 'src/auth/Context';

export const MenuItemWithAuth = forwardRef<MenuItemProps, typeof MenuItem>(
  (props, ref) => {
    const { isEnabled, isAuthenticated } = useAuth();

    if (!isEnabled) {
      return <MenuItem ref={ref} {...props} />;
    }

    return isAuthenticated && <MenuItem ref={ref} {...props} />;
  }
);
```

**Step 3: Commit**

```bash
git add packages/client/src/components/auth/ButtonWithAuth.tsx packages/client/src/components/auth/MenuItemWithAuth.tsx
git commit -m "refactor(auth): use useAuth in ButtonWithAuth/MenuItemWithAuth"
```

#### Task 4f: `MainNavigation.tsx`

**Files:**
- Modify: `packages/client/src/components/MainNavigation.tsx`

**Step 1: Swap hook and condition**

- Change `import { useKeycloak } from 'src/auth/Context';` → `import { useAuth } from 'src/auth/Context';`
- Change `const { keycloak, isEnabled } = useKeycloak();` → `const { isEnabled, isAuthenticated } = useAuth();`
- Change `{keycloak?.authenticated && (` → `{isAuthenticated && (`

**Step 2: Commit**

```bash
git add packages/client/src/components/MainNavigation.tsx
git commit -m "refactor(auth): use useAuth in MainNavigation"
```

#### Task 4g: `CollectionForm/index.tsx`

**Files:**
- Modify: `packages/client/src/pages/CollectionForm/index.tsx`

**Step 1: Swap hook and `keycloak?.token` → `token`**

- Change `import { useKeycloak } from '../../auth/Context';` → `import { useAuth } from '../../auth/Context';`
- Change both `const { keycloak } = useKeycloak();` → `const { token } = useAuth();`
- Change `collectionTransaction(keycloak?.token)` → `collectionTransaction(token)` (both call sites, lines 50 and 111).

**Step 2: Commit**

```bash
git add packages/client/src/pages/CollectionForm/index.tsx
git commit -m "refactor(auth): use useAuth in CollectionForm"
```

#### Task 4h: Typecheck & lint the full client

**Step 1: Typecheck**

Run: `cd packages/client && npm run ts-check`
Expected: PASS.

**Step 2: Lint**

Run: `cd packages/client && npm run lint`
Expected: PASS (only pre-existing warnings, no new ones).

**Step 3: Confirm all `useKeycloak` / `keycloak-js` references are gone**

Run: `grep -R "useKeycloak\|KeycloakProvider\|keycloak-js" packages/client/src`
Expected: no output.

**Step 4: Commit any trailing cleanups** (if the grep surfaces anything).

---

### Task 5: Update `.env.example` and document the migration

**Files:**
- Modify: `packages/client/.env.example`

**Step 1: Replace the auth section**

Replace the current block:
```
# ====================
# Keycloak Auth Config
# ====================
# If not provided, authentication will be disabled.

# Base URL of the Keycloak server
REACT_APP_KEYCLOAK_URL=

# Client ID registered in Keycloak
REACT_APP_KEYCLOAK_CLIENT_ID=

# Realm name in Keycloak
REACT_APP_KEYCLOAK_REALM=
```

With:
```
# ================
# OIDC Auth Config
# ================
# If not provided, authentication will be disabled.
# Works with any OIDC provider (Keycloak, Auth0, Cognito, Okta, Entra, Google, ...).

# OIDC issuer / authority URL
# For Keycloak, this is: <base-url>/realms/<realm>
# e.g. https://iam.example.com/realms/my-realm
REACT_APP_OIDC_AUTHORITY=

# OIDC client ID registered with your provider
REACT_APP_OIDC_CLIENT_ID=

# -------------------------------------------------
# DEPRECATED — Keycloak-specific vars
# -------------------------------------------------
# These are supported for backwards compatibility but will emit a console
# warning at runtime. Prefer the REACT_APP_OIDC_* vars above.
# REACT_APP_KEYCLOAK_URL=
# REACT_APP_KEYCLOAK_CLIENT_ID=
# REACT_APP_KEYCLOAK_REALM=
```

**Step 2: Commit**

```bash
git add packages/client/.env.example
git commit -m "docs(env): document new REACT_APP_OIDC_* vars, deprecate KEYCLOAK_*"
```

---

### Task 6: Update `docker-entrypoint.sh` to substitute new vars

The entrypoint `sed`s placeholders into built files. Add substitutions for the new vars **alongside** the old ones so both paths work.

**Files:**
- Modify: `docker-entrypoint.sh`

**Step 1: Add new substitutions**

Insert these lines next to the existing Keycloak substitutions (preserve the Keycloak lines unchanged):

```sh
  -e "s|%REACT_APP_OIDC_AUTHORITY%|${REACT_APP_OIDC_AUTHORITY:-}|g" \
  -e "s|%REACT_APP_OIDC_CLIENT_ID%|${REACT_APP_OIDC_CLIENT_ID:-}|g" \
```

**Step 2: Smoke-test locally**

Run: `bash -n docker-entrypoint.sh`
Expected: no syntax errors.

**Step 3: Commit**

```bash
git add docker-entrypoint.sh
git commit -m "chore(docker): substitute REACT_APP_OIDC_* env vars at runtime"
```

---

### Task 7: Update Helm chart

Helm already uses `oidc.*` values but maps them onto the deprecated Keycloak env vars. Switch to emitting the new env vars, with backwards-compatible derivation from the legacy keys.

**Files:**
- Modify: `charts/stac-manager/templates/deployment.yaml`
- Modify: `charts/stac-manager/values.yaml` (add an `oidc` example block in a comment)

**Step 1: Replace the oidc env block in `deployment.yaml`**

Replace lines 52–59 (the `{{ if .Values.oidc }}` block) with:

```yaml
          {{ if .Values.oidc }}
          {{- $authority := .Values.oidc.authority }}
          {{- if and (not $authority) .Values.oidc.providerUrl .Values.oidc.realm }}
          {{- $authority = printf "%s/realms/%s" (trimSuffix "/" .Values.oidc.providerUrl) .Values.oidc.realm }}
          {{- end }}
          - name: REACT_APP_OIDC_AUTHORITY
            value: {{ $authority | required "Please provide .Values.oidc.authority (or legacy .Values.oidc.providerUrl + .Values.oidc.realm)" }}
          - name: REACT_APP_OIDC_CLIENT_ID
            value: {{ .Values.oidc.clientId | required "Please provide a value for oidc.clientId" }}
          {{ end }}
```

This:
- Prefers `oidc.authority` (new).
- Falls back to deriving it from `oidc.providerUrl` + `oidc.realm` (existing chart users keep working).
- Always emits the new `REACT_APP_OIDC_*` env vars — no deprecation warning in logs for Helm-based deployments.

**Step 2: Add a commented example block to `values.yaml`**

Append to `values.yaml`:

```yaml
# OIDC authentication configuration (optional).
# When omitted, authentication is disabled.
#
# oidc:
#   # Preferred: the OIDC issuer/authority URL. For Keycloak this is
#   # <keycloak-url>/realms/<realm>.
#   authority: https://iam.example.com/realms/my-realm
#   clientId: my-client
#
#   # Legacy (deprecated): supported for backwards compatibility. If `authority`
#   # is not set, it will be derived as "{providerUrl}/realms/{realm}".
#   # providerUrl: https://iam.example.com
#   # realm: my-realm
```

**Step 3: Render the chart locally to verify templating**

Run: `helm template charts/stac-manager --set stacApi=https://example.com --set publicUrl=https://example.com --set oidc.authority=https://idp.example.com/realms/r --set oidc.clientId=app | grep -A1 REACT_APP_OIDC`

Expected output contains:
```
          - name: REACT_APP_OIDC_AUTHORITY
            value: https://idp.example.com/realms/r
          - name: REACT_APP_OIDC_CLIENT_ID
            value: app
```

Then run the same with legacy keys:

Run: `helm template charts/stac-manager --set stacApi=https://example.com --set publicUrl=https://example.com --set oidc.providerUrl=https://iam.example.com --set oidc.realm=eoepca --set oidc.clientId=eoapi | grep -A1 REACT_APP_OIDC`

Expected output contains:
```
          - name: REACT_APP_OIDC_AUTHORITY
            value: https://iam.example.com/realms/eoepca
          - name: REACT_APP_OIDC_CLIENT_ID
            value: eoapi
```

If `helm` is not installed locally, note this in the task notes and defer to CI.

**Step 4: Commit**

```bash
git add charts/stac-manager/templates/deployment.yaml charts/stac-manager/values.yaml
git commit -m "feat(helm): emit REACT_APP_OIDC_* env vars, keep legacy keys"
```

---

### Task 8: Update `packages/client/README.md`

**Files:**
- Modify: `packages/client/README.md`

**Step 1: Replace the auth section**

Replace the existing `# Auth` block under the env vars list **and** the prose "Auth" subsection with:

```markdown
# Auth (OIDC)
REACT_APP_OIDC_AUTHORITY
REACT_APP_OIDC_CLIENT_ID

# Auth (DEPRECATED — Keycloak-specific shim)
REACT_APP_KEYCLOAK_URL
REACT_APP_KEYCLOAK_CLIENT_ID
REACT_APP_KEYCLOAK_REALM
```

And replace the **Auth** prose subsection with:

```markdown
**Auth**
The client supports any OIDC-compliant identity provider (Keycloak, Auth0,
Cognito, Okta, Entra, Google, …). Authentication is disabled by default. To
enable it, set:

- `REACT_APP_OIDC_AUTHORITY` — the issuer/authority URL. For Keycloak this is
  `<keycloak-url>/realms/<realm>` (e.g. `https://iam.example.com/realms/my-realm`).
- `REACT_APP_OIDC_CLIENT_ID` — the client ID registered with your provider.

Your OIDC client must allow the app's origin as a valid redirect URI. For
Keycloak specifically, ensure **Web Origins** on the client includes the app
origin (or `+` to inherit from Valid Redirect URIs) so the silent-renew flow
works.

> [!NOTE]
> The legacy `REACT_APP_KEYCLOAK_URL`, `REACT_APP_KEYCLOAK_CLIENT_ID`, and
> `REACT_APP_KEYCLOAK_REALM` environment variables are still supported but are
> **deprecated**. If they are used, the app logs a console warning at startup
> and derives `authority = <KEYCLOAK_URL>/realms/<KEYCLOAK_REALM>`. Migrate to
> the `REACT_APP_OIDC_*` variables at your earliest convenience.
```

**Step 2: Commit**

```bash
git add packages/client/README.md
git commit -m "docs(client): document OIDC auth and keycloak deprecation"
```

---

### Task 9: Update root `README.md`

The root README mentions "standard authentication and authorization flows" but does not name Keycloak. Add a brief pointer to the new vars.

**Files:**
- Modify: `README.md`

**Step 1: Edit the Introduction paragraph**

Replace:
```
It currently connects to a STAC API via the the [STAC API - Transation Extension](https://github.com/stac-api-extensions/transaction) and can be configured to support standard authentication and authorization flows, if needed.
```

With:
```
It currently connects to a STAC API via the [STAC API - Transaction Extension](https://github.com/stac-api-extensions/transaction) and can be configured to use any OIDC-compliant identity provider (Keycloak, Auth0, Cognito, Okta, Entra, Google, …) for authentication. See [packages/client/README.md](./packages/client/README.md#auth) for configuration details.
```

(Note: this also fixes the existing typos "the the" and "Transation".)

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: mention generic OIDC support in root README"
```

---

### Task 10: Manual verification against the live EOEPCA IdP

This migration has meaningful runtime behavior that can't be caught by typechecks or unit tests. Verify end-to-end before calling it done.

**Step 1: Run the dev server with the current (legacy) `.env`**

Run: `npm run plugins:build && npm run client:serve`

Open the app in the browser with DevTools console open.

Expected:
- A console warning: `[stac-manager] REACT_APP_KEYCLOAK_* env vars are deprecated…`
- No network request to `/realms/eoepca/account` (the original CORS bug).
- Login button visible.

**Step 2: Click Login and complete the Keycloak flow**

Expected:
- Redirect to `iam-auth.develop.eoepca.org`.
- After login, redirect back to the app.
- UI shows the user's name/email (from the parsed ID token).
- No CORS errors in the console.

**Step 3: Try a protected action (e.g. navigate to `/collections/new`)**

Expected:
- Form renders (auth is valid).
- A request to the STAC API carries `Authorization: Bearer …` from `useAuth().token`.

**Step 4: Click Logout**

Expected:
- Redirected to Keycloak logout and back to the app.
- UI returns to logged-out state.

**Step 5: Migrate `.env` to the new vars and re-verify**

Comment out `REACT_APP_KEYCLOAK_*` and set:
```
REACT_APP_OIDC_AUTHORITY="https://iam-auth.develop.eoepca.org/realms/eoepca"
REACT_APP_OIDC_CLIENT_ID="eoapi"
```

Restart the dev server.

Expected:
- **No** deprecation warning in the console.
- Login flow works identically.
- Note: this modifies the user's local `.env`; revert after testing or leave it as the new recommended configuration.

**Step 6: Final verification report**

Write up (in the PR description or as a follow-up comment) which of steps 1–5 were observed working. If any step fails, triage before merging.

---

### Task 11: @superpowers:requesting-code-review

Once all tasks above are complete and the branch is clean, invoke a code review pass per the `superpowers:requesting-code-review` skill to verify the change set against this plan and coding standards before opening the PR.

---

## Non-goals / explicitly out of scope

- Replacing the "auth disabled" branch with a no-op provider file split. The conditional-render approach in `Context.tsx` keeps the change minimal.
- Adding a dedicated `/callback` route. `react-oidc-context`'s `onSigninCallback` handles the query-param cleanup inline.
- Token refresh / silent renew configuration beyond the library defaults. `react-oidc-context` enables `automaticSilentRenew` by default; no further work required unless manual testing reveals an issue.
- Removing the legacy `REACT_APP_KEYCLOAK_*` env vars. They stay functional (with a warning) for at least one release to give operators time to migrate.
