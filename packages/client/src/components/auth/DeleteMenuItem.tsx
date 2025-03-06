import React from 'react';
import { MenuItem, MenuItemProps } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { CollecticonTrashBin } from '@devseed-ui/collecticons-chakra';

export function DeleteMenuItem(props: MenuItemProps) {
  const { isAuthenticated } = useAuth0();
  return (
    isAuthenticated && (
      <MenuItem
        icon={<CollecticonTrashBin />}
        color='danger.500'
        _hover={{ bg: 'danger.200' }}
        _focus={{ bg: 'danger.200' }}
        {...props}
      >
        Delete
      </MenuItem>
    )
  );
}
