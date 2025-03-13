import React from 'react';
import { Button, ButtonProps, forwardRef } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import SmartLink, { SmartLinkProps } from '../SmartLink';

export const ButtonWithAuth = forwardRef<
  SmartLinkProps & ButtonProps,
  typeof Button
>((props, ref) => {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated && <Button ref={ref} as={SmartLink} {...props} />;
});
