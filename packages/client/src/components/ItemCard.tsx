import React from 'react';
import {
  Card,
  Flex,
  Image,
  Text,
  Heading,
  Box,
  HStack,
  Tag,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import SmartLink from './SmartLink';
import { ItemCardThumbPlaceholder } from './ItemCardThumbPlaceholder';

interface ItemCardProps {
  imageSrc?: string;
  imageAlt?: string;
  showPlaceholder?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  to?: string;
  renderMenu?: () => React.ReactNode;
}

export function ItemCard({
  imageSrc,
  imageAlt,
  showPlaceholder,
  title,
  subtitle,
  description,
  tags,
  to,
  renderMenu
}: ItemCardProps) {
  const renderLink = (children: React.ReactNode) => {
    return to ? (
      <SmartLink to={to} color='inherit'>
        {children}
      </SmartLink>
    ) : (
      <>{children}</>
    );
  };

  const shouldUsePlaceholder = showPlaceholder && !imageSrc;

  return (
    <Card.Root as='article' variant={'filled' as 'subtle'}>
      {imageSrc &&
        renderLink(
          <Image
            src={imageSrc}
            alt={imageAlt}
            width='100%'
            aspectRatio={2}
            objectFit='cover'
            borderRadius='md'
          />
        )}
      {shouldUsePlaceholder && renderLink(<ItemCardThumbPlaceholder />)}
      <Card.Header as='header'>
        <Flex direction='row' gap={4}>
          {(title || subtitle) && (
            <Box flexBasis='100%'>
              {title && (
                <Heading size='sm' as='h3' wordBreak='break-word'>
                  {renderLink(title)}
                </Heading>
              )}
              {subtitle && (
                <Text as='p' fontSize='sm' color='base.400'>
                  {subtitle}
                </Text>
              )}
            </Box>
          )}
          {renderMenu && <Box>{renderMenu()}</Box>}
        </Flex>
      </Card.Header>
      {description && (
        <Card.Body>
          <Text>{description}</Text>
        </Card.Body>
      )}
      {tags && tags.length > 0 && (
        <Card.Footer as='footer'>
          <HStack gap={2} wrap='wrap'>
            {tags.map((tag) => (
              <Tag.Root key={tag} size='sm' colorPalette='primary'>
                <Tag.Label>{tag}</Tag.Label>
              </Tag.Root>
            ))}
          </HStack>
        </Card.Footer>
      )}
    </Card.Root>
  );
}

export function ItemCardLoading(props: { mini?: boolean }) {
  return (
    <Card.Root as='article' variant={'filled' as 'subtle'} p={8}>
      <Flex direction='column' gap={2}>
        <Skeleton h={6} width='40%' />
        <Skeleton h={4} width='30%' />
      </Flex>

      {!props.mini && (
        <>
          <SkeletonText mt={8} noOfLines={4} />
          <Flex gap={2} mt={12}>
            <Skeleton h={4} width={12} />
            <Skeleton h={4} width={12} />
            <Skeleton h={4} width={12} />
          </Flex>
        </>
      )}
    </Card.Root>
  );
}
