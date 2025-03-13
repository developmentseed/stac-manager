import React from 'react';
import { forwardRef, MenuItem, MenuItemProps } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';

export const MenuItemWithAuth = forwardRef<MenuItemProps, typeof MenuItem>(
  (props, ref) => {
    const { isAuthenticated } = useAuth0();
    return isAuthenticated ? <MenuItem ref={ref} {...props} /> : null;
  }
);
