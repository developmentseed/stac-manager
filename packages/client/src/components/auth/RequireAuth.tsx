import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';

import { InnerPageHeader } from '$components/InnerPageHeader';
import usePageTitle from '$hooks/usePageTitle';
import { useAuth0IfEnabled } from './authIfEnabled';

export function RequireAuth(
  props: {
    Component: React.ElementType;
  } & Record<string, any>
) {
  const { Component, ...rest } = props;
  usePageTitle('Authentication Required');

  const auth = useAuth0IfEnabled();

  if (!auth.isEnabled) {
    return <Component {...rest} />;
  }
  const { isAuthenticated, loginWithRedirect } = auth;

  if (isAuthenticated) {
    return <Component {...rest} />;
  }

  return (
    <Flex direction='column' gap={4}>
      <InnerPageHeader title='Authentication Required' overline='Oops' />
      <Flex direction='column' gap={2} p={4}>
        <Text>You need to login to access this content.</Text>
        <Button
          alignSelf='flex-start'
          variant='solid'
          colorScheme='primary'
          onClick={() => {
            loginWithRedirect({
              appState: { returnTo: window.location.pathname }
            });
          }}
        >
          Login
        </Button>
      </Flex>
    </Flex>
  );
}
