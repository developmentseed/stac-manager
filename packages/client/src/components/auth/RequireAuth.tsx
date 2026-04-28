import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';

import { InnerPageHeader } from '$components/InnerPageHeader';
import usePageTitle from '$hooks/usePageTitle';
import { useAuth } from 'src/auth/Context';

export function RequireAuth(
  props: {
    Component: React.ElementType;
  } & Record<string, any>
) {
  const { Component, ...rest } = props;
  usePageTitle('Authentication Required');

  const auth = useAuth();

  if (!auth.isEnabled) {
    return <Component {...rest} />;
  }

  if (auth.isAuthenticated) {
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
          onClick={() => auth.login({ redirectUri: window.location.href })}
        >
          Login
        </Button>
      </Flex>
    </Flex>
  );
}
