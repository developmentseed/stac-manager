import React, { useEffect, useState } from 'react';
import { Avatar, Button } from '@chakra-ui/react';
import {
  CollecticonLogin,
  CollecticonLogout
} from '@devseed-ui/collecticons-chakra';

import { useAuth } from 'src/auth/Context';

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
  const { profile, isLoading, isEnabled, isAuthenticated, login, logout } =
    useAuth();

  const [userEmailHash, setUserEmailHash] = useState<string>('');
  useEffect(() => {
    if (profile?.email) {
      hash(profile.email).then(setUserEmailHash);
    }
  }, [profile?.email]);

  if (!isEnabled) {
    return null;
  }

  if (!isAuthenticated || !profile || isLoading) {
    return (
      <Button
        variant='outline'
        onClick={() => {
          if (!isLoading) {
            login({
              redirectUri: window.location.href
            });
          }
        }}
      >
        Login
        <CollecticonLogin />
      </Button>
    );
  }

  const username =
    `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

  return (
    <Button
      variant='outline'
      pl='2px'
      onClick={() => {
        if (!isLoading) {
          logout({
            redirectUri: window.location.href
          });
        }
      }}
    >
      <Avatar.Root
        asChild
        size='sm'
        bg='secondary.500'
        color='white'
        borderRadius='4px'
      >
        <span>
          <Avatar.Image
            src={`https://www.gravatar.com/avatar/${userEmailHash}?d=404`}
          />
          <Avatar.Fallback name={username} />
        </span>
      </Avatar.Root>
      Logout
      <CollecticonLogout />
    </Button>
  );
}
