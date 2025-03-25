import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Tag,
  Button,
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
  SkeletonText,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  ButtonGroup
} from '@chakra-ui/react';
import { useCollection, useStacSearch } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonEye,
  CollecticonPencil,
  CollecticonTextBlock,
  CollecticonTrashBin
} from '@devseed-ui/collecticons-chakra';
import { StacCollection, StacItem } from 'stac-ts';

import { usePageTitle } from '../../hooks';
import CollectionMap from './CollectionMap';
import SmartLink from '$components/SmartLink';
import { InnerPageHeader } from '$components/InnerPageHeader';
import { StacBrowserMenuItem } from '$components/StacBrowserMenuItem';
import { ItemCard, ItemCardLoading } from '$components/ItemCard';
import { zeroPad } from '$utils/format';
import { ItemMap } from '$pages/ItemDetail/ItemMap';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

function CollectionDetail() {
  const { collectionId } = useParams();
  usePageTitle(`Collection ${collectionId}`);

  const { collection, state } = useCollection(collectionId!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

  const {
    results,
    collections,
    setCollections,
    submit,
    nextPage,
    previousPage
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

  const resultCount = results?.numberMatched || 0;
  const shouldPaginate =
    results?.links?.length > 1 && resultCount > results?.numberReturned;

  return (
    <Flex direction='column' gap={8}>
      <InnerPageHeader
        overline='Viewing Collection'
        title={title || id}
        actions={
          <>
            <Button
              as={SmartLink}
              to={`/collections/${id}/edit`}
              colorScheme='primary'
              size='md'
              leftIcon={<CollecticonPencil />}
            >
              Edit
            </Button>
            <Menu placement='bottom-end'>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<CollecticonEllipsisVertical />}
                variant='outline'
                size='md'
              />
              <MenuList>
                <StacBrowserMenuItem resourcePath={`/collections/${id}`} />
                <MenuItem
                  icon={<CollecticonTrashBin />}
                  color='danger.500'
                  _hover={{ bg: 'danger.200' }}
                  _focus={{ bg: 'danger.200' }}
                  onClick={() => alert('Soon!')}
                >
                  Delete
                </MenuItem>
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
              {results && <Badge variant='solid'>{zeroPad(resultCount)}</Badge>}
            </Heading>
            {!!resultCount && (
              <Text size='sm' color='base.400'>
                Showing page {page} of{' '}
                {Math.ceil(resultCount / results.numberReturned)}
              </Text>
            )}
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
                    <Flex gap={2}>
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
                      <Popover placement='top' isLazy>
                        {({ isOpen }) => (
                          <>
                            <PopoverTrigger>
                              <IconButton
                                aria-label='Preview'
                                icon={<CollecticonEye />}
                                variant='outline'
                                size='sm'
                                isActive={isOpen}
                              />
                            </PopoverTrigger>
                            <PopoverContent
                              boxShadow='sm'
                              borderColor='base.200'
                              borderWidth='2px'
                            >
                              <PopoverArrow bg='base.200' />
                              <PopoverBody
                                p={0}
                                overflow='hidden'
                                borderRadius='md'
                              >
                                <Box h='15rem'>
                                  <ItemMap item={item} reuseMaps />
                                </Box>
                              </PopoverBody>
                            </PopoverContent>
                          </>
                        )}
                      </Popover>
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
            <ButtonGroup size='sm' variant='outline' isAttached>
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
