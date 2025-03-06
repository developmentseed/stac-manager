import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import SmartLink, { SmartLinkProps } from '../SmartLink';

export function ButtonWithAuth(props: SmartLinkProps & ButtonProps) {
  const { isAuthenticated } = useAuth0();
  return (
    isAuthenticated && (
      <Button as={SmartLink} colorScheme='primary' size='sm' {...props} />
    )
  );
}
