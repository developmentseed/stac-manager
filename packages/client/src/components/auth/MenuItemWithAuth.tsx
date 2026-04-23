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
