import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
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
      <Box
        as='button'
        onClick={() => {
          if (!isLoading) {
            keycloak.login({
              redirectUri: window.location.href
            });
          }
        }}
        _hover={{ opacity: 0.8 }}
        transition='opacity 0.32s'
      >
        <Avatar size='sm' />
      </Box>
    );
  }

  const username =
    `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

  return (
    <Menu>
      <Box as={MenuButton} _hover={{ opacity: 0.8 }} transition='opacity 0.32s'>
        <Avatar
          size='sm'
          name={username}
          bg='primary.500'
          borderRadius='md'
          src={`https://www.gravatar.com/avatar/${userEmailHash}`}
        />
      </Box>
      <MenuList>
        <MenuGroup title='Account'>
          <MenuItem>Profile</MenuItem>
          <MenuItem
            color='danger.500'
            _hover={{ bg: 'danger.200' }}
            _focus={{ bg: 'danger.200' }}
            onClick={() => {
              keycloak.logout({
                redirectUri: window.location.origin
              });
            }}
          >
            Log Out
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
}
