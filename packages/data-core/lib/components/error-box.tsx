import React from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';

export function ErrorBox(props: FlexProps) {
  return (
    <Flex
      maxW='3xl'
      alignItems='center'
      direction='column'
      gap={4}
      py={16}
      px={8}
      color='red.500'
      borderRadius='md'
      borderWidth={1}
      borderStyle='dashed'
      borderColor='red.500'
      {...props}
    />
  );
}
