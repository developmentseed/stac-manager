import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Tag,
  Flex,
  IconButton,
  Menu,
  SimpleGrid,
  Heading,
  Badge,
  Grid,
  GridItem,
  HStack,
  VisuallyHidden,
  Skeleton,
  SkeletonText,
  Popover,
  ButtonGroup,
  Button,
  Portal
} from '@chakra-ui/react';
import { useCollection, useStacSearch } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonEye,
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
import { DeleteMenuItem } from '$components/DeleteMenuItem';
import SmartLink from '$components/SmartLink';
import { ItemMap } from '$pages/ItemDetail/ItemMap';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

function CollectionDetail() {
  const { collectionId } = useParams();
  usePageTitle(`Collection ${collectionId}`);

  const { collection, isLoading } = useCollection(collectionId!);

  const {
    results,
    collections,
    setCollections,
    submit,
    nextPage,
    previousPage,
    limit
  } = useStacSearch();

  // The stac search pagination is token based and has no pages, but we can fake
  // it tracking the prev and next clicks.
  const [page, setPage] = useState<number>(1);

  const onPageNavigate = useCallback(
    (actions: 'next' | 'previous') => {
      if (actions === 'next') {
        setPage((prev) => prev + 1);
        nextPage?.();
      } else {
        setPage((prev) => prev - 1);
        previousPage?.();
      }
    },
    [nextPage, previousPage]
  );

  // Initialize the search with the current collection ID.
  //
  // We depend on `collections` so this effect re-runs and re-applies the value
  // if useStacSearch's internal state-reset (M() in stac-react v1, fires when
  // its StacApi instance changes — e.g. token-driven rebuild during initial
  // OIDC load) wipes it back to undefined. Without this, direct page loads
  // that hit a token-load remount never restore `collections`, leaving the
  // query disabled (v stays null) and no /search request goes out.
  useEffect(() => {
    if (collectionId && collections?.[0] !== collectionId) {
      setCollections([collectionId]);
    }
  }, [collectionId, collections, setCollections]);

  // Automatically submit once collections is set (or re-set after a reset).
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

  if (!collection || isLoading) {
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

  const { id, title, description, keywords, license } =
    collection as StacCollection;

  // STAC APIs commonly include `numberMatched` (OAFeat / OGC Features
  // convention), but stac-react v1 dropped it from the typed SearchResponse.
  // Read it off the raw response when present; otherwise hide the badge to
  // avoid showing a misleading page-size count.
  const numberMatched = (results as { numberMatched?: number } | undefined)
    ?.numberMatched;
  const pageItemsCount = results?.features?.length ?? 0;
  const totalPages =
    numberMatched !== undefined && limit > 0
      ? Math.ceil(numberMatched / limit)
      : undefined;
  const shouldPaginate =
    (results?.links?.length ?? 0) > 1 && (!!nextPage || !!previousPage);

  return (
    <Flex direction='column' gap={8}>
      <InnerPageHeader
        overline='Viewing Collection'
        title={title || id}
        actions={
          <>
            <ButtonWithAuth
              colorPalette='primary'
              to={`/collections/${id}/edit`}
            >
              <CollecticonPencil />
              Edit
            </ButtonWithAuth>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton aria-label='Options' variant='outline' size='md'>
                  <CollecticonEllipsisVertical />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <StacBrowserMenuItem resourcePath={`/collections/${id}`} />
                    <DeleteMenuItem />
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
              {description && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Description
                  </Heading>
                  <Text>{description}</Text>
                </Flex>
              )}

              {dateLabel && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Temporal extent
                  </Heading>
                  <Text>{dateLabel}</Text>
                </Flex>
              )}

              {license && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    License
                  </Heading>
                  <Text>{license}</Text>
                </Flex>
              )}

              {keywords && (
                <Flex direction='column' gap='2'>
                  <Heading size='sm' as='h3'>
                    Keywords
                  </Heading>
                  <HStack gap={2}>
                    {keywords.map((keyword) => (
                      <Tag.Root key={keyword} size='md' colorPalette='primary'>
                        <Tag.Label>{keyword}</Tag.Label>
                      </Tag.Root>
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
              {numberMatched !== undefined && (
                <Badge variant='solid'>{zeroPad(numberMatched)}</Badge>
              )}
            </Heading>
            {pageItemsCount > 0 && (
              <Text fontSize='sm' color='base.400'>
                {totalPages
                  ? `Showing page ${page} of ${totalPages}`
                  : `Showing page ${page}`}
              </Text>
            )}
          </Box>
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
                    <Flex gap={2}>
                      <Menu.Root positioning={{ placement: 'bottom-end' }}>
                        <Menu.Trigger asChild>
                          <IconButton
                            aria-label='Options'
                            variant='outline'
                            size='sm'
                          >
                            <CollecticonEllipsisVertical />
                          </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <StacBrowserMenuItem
                                resourcePath={`/collections/${id}/items/${item.id}`}
                              />
                              <Menu.Item value='view' asChild>
                                <SmartLink
                                  to={`/collections/${id}/items/${item.id}`}
                                >
                                  <CollecticonTextBlock />
                                  View
                                </SmartLink>
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                      <Popover.Root
                        positioning={{ placement: 'top' }}
                        lazyMount
                      >
                        <Popover.Trigger asChild>
                          <IconButton
                            aria-label='Preview'
                            variant='outline'
                            size='sm'
                          >
                            <CollecticonEye />
                          </IconButton>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content
                              boxShadow='sm'
                              borderColor='base.200'
                              borderWidth='2px'
                            >
                              <Popover.Arrow>
                                <Popover.ArrowTip />
                              </Popover.Arrow>
                              <Popover.Body
                                p={0}
                                overflow='hidden'
                                borderRadius='md'
                              >
                                <Box h='15rem'>
                                  <ItemMap item={item} reuseMaps />
                                </Box>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                    </Flex>
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
        {shouldPaginate && (
          <Flex direction='column' alignItems='center'>
            <ButtonGroup size='sm' variant='outline' attached>
              <Button
                disabled={!previousPage}
                onClick={() => onPageNavigate('previous')}
              >
                Previous
              </Button>
              <Button
                disabled={!nextPage}
                onClick={() => onPageNavigate('next')}
              >
                Next
              </Button>
            </ButtonGroup>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default CollectionDetail;
