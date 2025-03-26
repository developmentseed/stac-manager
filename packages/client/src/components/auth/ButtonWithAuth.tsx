import React from 'react';
import { Button, ButtonProps, forwardRef } from '@chakra-ui/react';
import SmartLink, { SmartLinkProps } from '../SmartLink';
import { useKeycloak } from 'src/auth/Context';

export const ButtonWithAuth = forwardRef<
  SmartLinkProps & ButtonProps,
  typeof Button
>((props, ref) => {
  const { isEnabled, keycloak } = useKeycloak();

  if (!isEnabled) {
    return <Button ref={ref} as={SmartLink} {...props} />;
  }

  return (
    keycloak.authenticated && <Button ref={ref} as={SmartLink} {...props} />
  );
});
