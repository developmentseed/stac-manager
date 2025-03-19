import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

import { InnerPageHeader } from '$components/InnerPageHeader';
import usePageTitle from '$hooks/usePageTitle';

export default function Callback() {
  usePageTitle('Authorizing');

  return (
    <Flex direction='column' gap={4}>
      <InnerPageHeader
        title='You are being logging in'
        overline='Authorizing'
      />
      <Flex direction='column' gap={2} p={4}>
        <Text>Loading resources. Hang tight!</Text>
      </Flex>
    </Flex>
  );
}
