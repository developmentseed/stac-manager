import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Tag,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Heading,
  Badge,
  Grid,
  GridItem,
  HStack,
  VisuallyHidden,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { useCollection, useStacSearch } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonPencil,
  CollecticonTextBlock
} from '@devseed-ui/collecticons-chakra';
import { StacCollection, StacItem } from 'stac-ts';

import { usePageTitle } from '../../hooks';
import CollectionMap from './CollectionMap';
import { InnerPageHeader } from '$components/InnerPageHeader';
import { StacBrowserMenuItem } from '$components/StacBrowserMenuItem';
import { ItemCard, ItemCardLoading } from '$components/ItemCard';
import { zeroPad } from '$utils/format';
import { ButtonWithAuth } from '$components/auth/ButtonWithAuth';
import { DeleteMenuItem } from '$components/auth/DeleteMenuItem';
import SmartLink from '$components/SmartLink';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

function CollectionDetail() {
  const { collectionId } = useParams();
  usePageTitle(`Collection ${collectionId}`);

  // const [urlParams, setUrlParams] = useSearchParams({ page: '1' });
  // const page = parseInt(urlParams.get('page') || '1', 10);
  // const setPage = useCallback(
  //   (v: number | ((v: number) => number)) => {
  //     const newVal = typeof v === 'function' ? v(page) : v;
  //     setUrlParams({ page: newVal.toString() });
  //   },
  //   [page]
  // );

  const { collection, state } = useCollection(collectionId!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

  const { results, collections, setCollections, submit } = useStacSearch();

  // Initialize the search with the current collection ID
  useEffect(() => {
    setCollections([collectionId]);
  }, [collectionId, setCollections]);

  // Automatically submit whenever the collection ID changes
  useEffect(() => {
    if (!collections) return;
    submit();
  }, [collections, submit]);

  const dateLabel = useMemo(() => {
    if (!collection) {
      return;
    }

    const [fromDate, toDate] = collection.extent.temporal.interval[0];
    const fromLabel =
      fromDate && new Date(fromDate).toLocaleString('en-GB', dateFormat);
    const toLabel =
      toDate && new Date(toDate).toLocaleString('en-GB', dateFormat);

    if (fromLabel && toLabel) {
      return `${fromLabel} – ${toLabel}`;
    }

    if (fromLabel) {
      return `From: ${fromLabel}`;
    }

    if (toLabel) {
      return `To: ${toLabel}`;
    }

    return '—';
  }, [collection]);

  if (!collection || state === 'LOADING') {
    return (
      <Box p={8}>
        <Flex direction='column' gap={4}>
          <Skeleton h={6} maxW='25rem' />
          <Skeleton h={12} maxW='30rem' />
        </Flex>

        <SkeletonText
          mt={8}
          noOfLines={4}
          spacing='4'
          skeletonHeight='2'
          maxW='50rem'
        />
      </Box>
    );
  }

  const { id, title, description, keywords, license } =
    collection as StacCollection;

  return (
    <Flex direction='column' gap={8}>
      <InnerPageHeader
        overline='Viewing Collection'
        title={title || id}
        actions={
          <>
            <ButtonWithAuth
              colorScheme='primary'
              size='sm'
              to={`/collections/${id}/edit`}
              leftIcon={<CollecticonPencil />}
            >
              Edit
            </ButtonWithAuth>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<CollecticonEllipsisVertical />}
                variant='outline'
                size='md'
              />
              <MenuList>
                <StacBrowserMenuItem resourcePath={`/collections/${id}`} />
                <DeleteMenuItem />
              </MenuList>
            </Menu>
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
              {description && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Description
                  </Heading>
                  <Text size='md'>{description}</Text>
                </Flex>
              )}

              {dateLabel && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Temporal extent
                  </Heading>
                  <Text size='md'>{dateLabel}</Text>
                </Flex>
              )}

              {license && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    License
                  </Heading>
                  <Text size='md'>{license}</Text>
                </Flex>
              )}

              {keywords && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Keywords
                  </Heading>
                  <HStack spacing={2}>
                    {keywords.map((keyword) => (
                      <Tag key={keyword} size='md' colorScheme='primary'>
                        {keyword}
                      </Tag>
                    ))}
                  </HStack>
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
                <CollectionMap collection={collection} />
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>

      <Flex direction='column' gap='8' as='section'>
        <Flex direction='row' px='8' gap='8' as='header'>
          <Box flexBasis='100%'>
            <Heading size='md' as='h2'>
              Items{' '}
              {results && (
                <Badge variant='solid'>{zeroPad(results.numberMatched)}</Badge>
              )}
            </Heading>
          </Box>
          {/* <Flex direction='row' gap='4'>
            <Button
              as={SmartLink}
              to='/item/new'
              colorScheme='primary'
              size='md'
              leftIcon={<CollecticonPlusSmall />}
            >
              Add new
            </Button>
          </Flex> */}
        </Flex>
        <SimpleGrid
          gap={8}
          templateColumns='repeat(auto-fill, minmax(18rem, 1fr))'
        >
          {results ? (
            results.features.map((item: StacItem) => (
              <ItemCard
                key={item.id}
                title={item.id}
                to={`/collections/${id}/items/${item.id}`}
                renderMenu={() => {
                  return (
                    <Menu placement='bottom-end'>
                      <MenuButton
                        as={IconButton}
                        aria-label='Options'
                        icon={<CollecticonEllipsisVertical />}
                        variant='outline'
                        size='sm'
                      />
                      <MenuList>
                        <StacBrowserMenuItem
                          resourcePath={`/collections/${id}/items/${item.id}`}
                        />
                        <MenuItem
                          as={SmartLink}
                          to={`/collections/${id}/items/${item.id}`}
                          icon={<CollecticonTextBlock />}
                        >
                          View
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  );
                }}
              />
            ))
          ) : (
            <>
              <ItemCardLoading mini />
              <ItemCardLoading mini />
              <ItemCardLoading mini />
            </>
          )}
        </SimpleGrid>
      </Flex>

      {/* <Flex direction='column' alignItems='center'>
        <Pagination numPages={20} page={page} onPageChange={setPage} />
      </Flex> */}
    </Flex>
  );
}

export default CollectionDetail;
