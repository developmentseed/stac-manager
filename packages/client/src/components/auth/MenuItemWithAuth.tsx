import React from 'react';
import { Menu, MenuItemProps } from '@chakra-ui/react';
import { useAuth } from 'src/auth/Context';

export function MenuItemWithAuth(props: MenuItemProps) {
  const { isEnabled, isAuthenticated } = useAuth();

  if (!isEnabled) {
    return <Menu.Item {...props} />;
  }

  return isAuthenticated && <Menu.Item {...props} />;
}
