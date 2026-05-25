import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import SmartLink, { SmartLinkProps } from '../SmartLink';
import { useAuth } from 'src/auth/Context';

export const ButtonWithAuth = forwardRef<
  HTMLButtonElement,
  ButtonProps & SmartLinkProps
>((props, ref) => {
  const { isEnabled, isAuthenticated } = useAuth();

  if (!isEnabled) {
    return <Button ref={ref} as={SmartLink} {...props} />;
  }

  return isAuthenticated && <Button ref={ref} as={SmartLink} {...props} />;
});
