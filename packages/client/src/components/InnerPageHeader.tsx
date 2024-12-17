import React, { useEffect, useRef, useState } from 'react';
import { Flex, Heading, Text, forwardRef, FlexProps } from '@chakra-ui/react';

interface InnerPageHeaderProps extends FlexProps {
  title: string;
  overline?: string;
  actions?: React.ReactNode;
}

export const InnerPageHeader = forwardRef<InnerPageHeaderProps, 'div'>(
  ({ title, overline, actions, ...rest }, ref) => {
    return (
      <Flex
        ref={ref}
        bg='base.50'
        borderRadius='md'
        p={4}
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
          <Heading size='md'>{title}</Heading>
          {actions && <Flex gap={2}>{actions}</Flex>}
        </Flex>
      </Flex>
    );
  }
);

export const InnerPageHeaderSticky = forwardRef<InnerPageHeaderProps, 'div'>(
  (props, ref) => {
    const [isAtTop, setIsAtTop] = useState(false);

    const localRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = localRef.current;
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

    const headerRef: React.RefCallback<HTMLDivElement> = (v) => {
      localRef.current = v;
      if (typeof ref === 'function') {
        ref(v);
      } else if (ref != null) {
        (ref as React.MutableRefObject<any>).current = v;
      }
    };

    return (
      <InnerPageHeader
        ref={headerRef}
        position='sticky'
        top='-1px'
        boxShadow={isAtTop ? 'md' : 'none'}
        zIndex={100}
        {...props}
      />
    );
  }
);
