import { useAuth0 } from '@auth0/auth0-react';
import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList
} from '@chakra-ui/react';
import React from 'react';

export function UserInfo() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  if (!isAuthenticated || !user || isLoading) {
    return (
      <Box
        as='button'
        onClick={() => {
          if (!isLoading) {
            loginWithRedirect({
              appState: { returnTo: window.location.pathname }
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

  const username = user.preferred_username || user.nickname || user.name;

  return (
    <Menu>
      <Box as={MenuButton} _hover={{ opacity: 0.8 }} transition='opacity 0.32s'>
        <Avatar size='sm' name={username} src={user.picture} />
      </Box>
      <MenuList>
        <MenuGroup title='Account'>
          <MenuItem>Profile</MenuItem>
          <MenuItem
            color='danger.500'
            _hover={{ bg: 'danger.200' }}
            _focus={{ bg: 'danger.200' }}
            onClick={() => {
              logout({ logoutParams: { returnTo: window.location.origin } });
            }}
          >
            Log Out
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
}
