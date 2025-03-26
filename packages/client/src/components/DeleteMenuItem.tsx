import React from 'react';
import { MenuItemProps } from '@chakra-ui/react';
import { CollecticonTrashBin } from '@devseed-ui/collecticons-chakra';

import { MenuItemWithAuth } from './auth/MenuItemWithAuth';

export function DeleteMenuItem(props: MenuItemProps) {
  return (
    <MenuItemWithAuth
      icon={<CollecticonTrashBin />}
      color='danger.500'
      _hover={{ bg: 'danger.200' }}
      _focus={{ bg: 'danger.200' }}
      {...props}
    >
      Delete
    </MenuItemWithAuth>
  );
}
