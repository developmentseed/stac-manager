import React from 'react';
import { Button, ButtonProps, forwardRef } from '@chakra-ui/react';
import SmartLink, { SmartLinkProps } from '../SmartLink';
import { useAuth } from 'src/auth/Context';

export const ButtonWithAuth = forwardRef<
  SmartLinkProps & ButtonProps,
  typeof Button
>((props, ref) => {
  const { isEnabled, isAuthenticated } = useAuth();

  if (!isEnabled) {
    return <Button ref={ref} as={SmartLink} {...props} />;
  }

  return isAuthenticated && <Button ref={ref} as={SmartLink} {...props} />;
});
