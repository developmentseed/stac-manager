import React from 'react';
import { MenuItemProps } from '@chakra-ui/react';
import { CollecticonTrashBin } from '@devseed-ui/collecticons-chakra';

import { MenuItemWithAuth } from './auth/MenuItemWithAuth';

export function DeleteMenuItem(props: Omit<MenuItemProps, 'value'> & { value?: string }) {
  const { value = 'delete', ...rest } = props;
  return (
    <MenuItemWithAuth
      value={value}
      color='danger.500'
      _hover={{ bg: 'danger.200' }}
      _focus={{ bg: 'danger.200' }}
      {...rest}
    >
      <CollecticonTrashBin />
      Delete
    </MenuItemWithAuth>
  );
}
