import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

import { usePageTitle } from '../hooks';
import SmartLink from '$components/SmartLink';
import { InnerPageHeader } from '$components/InnerPageHeader';

function NotFound() {
  usePageTitle('Not found');

  return (
    <Flex direction='column' gap={4}>
      <InnerPageHeader title='Not Found' overline='Error 404' />
      <Flex direction='column' gap={2} p={4}>
        <Text>The resource you&apos;re looking for could not be found.</Text>
        <Text>
          Perhaps in the mean time you can check out the{' '}
          <SmartLink to='/collections'>collections</SmartLink> page.
        </Text>
      </Flex>
    </Flex>
  );
}

export default NotFound;
