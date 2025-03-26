import React, { useEffect, useState } from 'react';
import { Avatar, Button } from '@chakra-ui/react';
import {
  CollecticonLogin,
  CollecticonLogout
} from '@devseed-ui/collecticons-chakra';

import { useKeycloak } from 'src/auth/Context';

async function hash(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export function UserInfo() {
  const { profile, isLoading, isEnabled, keycloak } = useKeycloak();

  const [userEmailHash, setUserEmailHash] = useState<string>('');
  useEffect(() => {
    if (profile?.email) {
      hash(profile.email).then(setUserEmailHash);
    }
  }, [profile?.email]);

  if (!isEnabled) {
    return null;
  }

  const isAuthenticated = keycloak.authenticated;

  if (!isAuthenticated || !profile || isLoading) {
    return (
      <Button
        variant='outline'
        rightIcon={<CollecticonLogin />}
        onClick={() => {
          if (!isLoading) {
            keycloak.login({
              redirectUri: window.location.href
            });
          }
        }}
      >
        Login
      </Button>
    );
  }

  const username =
    `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

  return (
    <Button
      variant='outline'
      rightIcon={<CollecticonLogout />}
      leftIcon={
        <Avatar
          size='sm'
          name={username}
          bg='secondary.500'
          color='white'
          borderRadius='4px'
          src={`https://www.gravatar.com/avatar/${userEmailHash}?d=404`}
        />
      }
      pl='2px'
    >
      Logout
    </Button>
  );
}
