import React from 'react';
import { forwardRef, MenuItem, MenuItemProps } from '@chakra-ui/react';
import { useKeycloak } from 'src/auth/Context';

export const MenuItemWithAuth = forwardRef<MenuItemProps, typeof MenuItem>(
  (props, ref) => {
    const { isEnabled, keycloak } = useKeycloak();

    if (!isEnabled) {
      return <MenuItem ref={ref} {...props} />;
    }

    return keycloak.authenticated && <MenuItem ref={ref} {...props} />;
  }
);
