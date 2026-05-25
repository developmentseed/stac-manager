import React, { forwardRef } from 'react';
import { Menu, MenuItemProps } from '@chakra-ui/react';
import { useAuth } from 'src/auth/Context';

export const MenuItemWithAuth = forwardRef<HTMLDivElement, MenuItemProps>(
  (props, ref) => {
    const { isEnabled, isAuthenticated } = useAuth();

    if (!isEnabled) {
      return <Menu.Item ref={ref} {...props} />;
    }

    return isAuthenticated && <Menu.Item ref={ref} {...props} />;
  }
);
MenuItemWithAuth.displayName = 'MenuItemWithAuth';
