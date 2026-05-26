import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import SmartLink, { SmartLinkProps } from '../SmartLink';
import { useAuth } from 'src/auth/Context';

export function ButtonWithAuth(props: ButtonProps & SmartLinkProps) {
  const { isEnabled, isAuthenticated } = useAuth();

  if (!isEnabled) {
    return <Button as={SmartLink} {...props} />;
  }

  return isAuthenticated && <Button as={SmartLink} {...props} />;
}
