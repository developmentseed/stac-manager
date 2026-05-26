import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Flex,
  IconButton,
  Menu,
  Heading,
  GridItem,
  Grid,
  VisuallyHidden,
  Skeleton,
  SkeletonText,
  Portal
} from '@chakra-ui/react';
import { useItem } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonTrashBin
} from '@devseed-ui/collecticons-chakra';

import { usePageTitle } from '../../hooks';
import { STAC_API_URL } from '../../api';
import AssetList from './AssetList';
import { InnerPageHeader } from '$components/InnerPageHeader';
import { StacBrowserMenuItem } from '$components/StacBrowserMenuItem';
import { ItemMap } from './ItemMap';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

function ItemDetail() {
  const { collectionId, itemId } = useParams();
  usePageTitle(`Item ${itemId}`);
  const itemResource = `${STAC_API_URL}/collections/${collectionId}/items/${itemId}`;
  const { item, isLoading } = useItem(itemResource);

  if (!item || isLoading) {
    return (
      <Box p={8}>
        <Flex direction='column' gap={4}>
          <Skeleton h={6} maxW='25rem' />
          <Skeleton h={12} maxW='30rem' />
        </Flex>

        <SkeletonText mt={8} noOfLines={4} maxW='50rem' />
      </Box>
    );
  }

  const { title, description, ...properties } = item.properties;

  return (
    <Flex direction='column' gap={8}>
      <InnerPageHeader
        overline='Viewing Item'
        title={title || item.id}
        actions={
          <>
            {/* <Button
              as={SmartLink}
              to={`/collections/${properties.collection}/items/${properties.id}/edit`}
              colorScheme='primary'
              size='sm'
              leftIcon={<CollecticonPencil />}
            >
              Edit
            </Button> */}
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
              <Menu.Trigger asChild>
                <IconButton aria-label='Options' variant='outline' size='md'>
                  <CollecticonEllipsisVertical />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <StacBrowserMenuItem
                      resourcePath={`/collections/${item.collection}/items/${item.id}`}
                    />
                    <Menu.Item
                      value='delete'
                      color='danger.500'
                      _hover={{ bg: 'danger.200' }}
                      _focus={{ bg: 'danger.200' }}
                      onClick={() => alert('Soon!')}
                    >
                      <CollecticonTrashBin />
                      Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </>
        }
      />

      <Flex direction='column' gap='8' as='section'>
        <Flex direction='row' px='8' gap='8' as='header'>
          <Box flexBasis='100%'>
            <Heading size='md' as='h2'>
              Overview
            </Heading>
          </Box>
        </Flex>

        <Grid templateColumns='repeat(12, 1fr)' gap={8}>
          <GridItem colSpan={8}>
            <Flex
              bg='base.50'
              borderRadius='md'
              p={8}
              direction='column'
              gap={4}
              minH='100%'
            >
              <Flex direction='column' gap='2'>
                <Heading size='sm' as='h3'>
                  Collection
                </Heading>
                <Text>{item.collection}</Text>
              </Flex>
              {description && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Description
                  </Heading>
                  <Text>{description} </Text>
                </Flex>
              )}
              {properties.datetime && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Date
                  </Heading>
                  <Text>
                    {new Date(properties.datetime).toLocaleString(
                      'en-GB',
                      dateFormat
                    )}
                  </Text>
                </Flex>
              )}
            </Flex>
          </GridItem>
          <GridItem colSpan={4}>
            <Flex
              bg='base.50'
              borderRadius='md'
              p={8}
              direction='column'
              gap={2}
              position='relative'
              overflow='hidden'
              height='20rem'
            >
              <Heading size='sm' as='h3'>
                <VisuallyHidden>Spacial extent</VisuallyHidden>
              </Heading>
              <Box position='absolute' inset='0'>
                <ItemMap item={item} />
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>

      <AssetList assets={item.assets} />
    </Flex>
  );
}

export default ItemDetail;
