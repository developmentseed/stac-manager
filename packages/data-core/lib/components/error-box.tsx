import React from 'react';
import { Box } from '@chakra-ui/react';

interface ErrorProps {
  children: React.ReactNode;
}

export function ErrorBox(props: ErrorProps) {
  const { children } = props;

  return (
    <Box
      maxW='container.md'
      textAlign='center'
      py='4rem'
      px='2rem'
      color='red'
      border='1px dashed red'
    >
      {children}
    </Box>
  );
}
