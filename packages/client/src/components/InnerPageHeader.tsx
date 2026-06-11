import React, { useEffect, useRef, useState } from 'react';
import { Flex, Heading, Text, FlexProps } from '@chakra-ui/react';

interface InnerPageHeaderProps extends FlexProps {
  title: string;
  overline?: string;
  actions?: React.ReactNode;
}

export function InnerPageHeader({
  title,
  overline,
  actions,
  ref,
  ...rest
}: InnerPageHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Flex
      ref={ref}
      bg='base.50'
      borderRadius='md'
      p={8}
      direction='column'
      gap={2}
      {...rest}
    >
      {overline && (
        <Text as='p' color='base.400'>
          {overline}
        </Text>
      )}
      <Flex gap={4} justifyContent='space-between' alignItems='center'>
        <Heading size='lg' lineClamp={1} as='h1'>
          {title}
        </Heading>
        {actions && <Flex gap={2}>{actions}</Flex>}
      </Flex>
    </Flex>
  );
}

export function InnerPageHeaderSticky(props: InnerPageHeaderProps) {
  const [isAtTop, setIsAtTop] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, []);

  return (
    <InnerPageHeader
      ref={ref}
      position='sticky'
      top='-1px'
      boxShadow={isAtTop ? 'md' : 'none'}
      zIndex={100}
      {...props}
    />
  );
}
