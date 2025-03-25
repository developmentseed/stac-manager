import React, { useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Heading,
  Box,
  SimpleGrid,
  InputGroup,
  Input,
  InputRightElement,
  Select,
  Badge,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import {
  CollecticonEllipsisVertical,
  CollecticonMagnifierRight,
  CollecticonPencil,
  CollecticonPlusSmall,
  CollecticonTextBlock
} from '@devseed-ui/collecticons-chakra';
import type { StacCollection } from 'stac-ts';

import { usePageTitle } from '../../hooks';
import { InnerPageHeader } from '$components/InnerPageHeader';
import SmartLink from '$components/SmartLink';
import { ItemCard, ItemCardLoading } from '$components/ItemCard';
import { zeroPad } from '$utils/format';
import { useCollections } from './useCollections';

function CollectionList() {
  usePageTitle('Collections');

  // const [urlParams, setUrlParams] = useSearchParams({ page: '1' });
  // const page = parseInt(urlParams.get('page') || '1', 10);
  // const setPage = useCallback(
  //   (v: number | ((v: number) => number)) => {
  //     const newVal = typeof v === 'function' ? v(page) : v;
  //     setUrlParams({ page: newVal.toString() });
  //   },
  //   [page]
  // );

  const { collections, state } = useCollections({
    limit: 1000
  });

  // Quick search system.
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');

  const keywords = useMemo<string[]>(() => {
    if (!collections) return [];
    const k = collections.collections.reduce(
      (acc: string[], col: StacCollection) => [...acc, ...(col.keywords || [])],
      []
    );
    return Array.from(new Set(k));
  }, [collections]);

  const filteredCollections = useMemo<StacCollection[]>(() => {
    if (!collections) return [];

    return collections.collections.filter((col: StacCollection) => {
      const title = col.title?.toLowerCase();
      const description = col.description?.toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const foundTerm =
        !term || title?.includes(term) || description?.includes(term);

      const keywords = col.keywords || [];
      const key = keyword.toLowerCase();

      const foundKeyword =
        !key || keywords.find((k) => k.toLowerCase() === key);

      return foundTerm && foundKeyword;
    });
  }, [collections, searchTerm, keyword]);

  const collectionsCount = collections?.numberMatched || 0;
  // const collectionsReturned = collections?.numberReturned || 0;
  // const numPages = Math.ceil(collectionsCount / pageSize);
  // const shouldPaginate = collectionsCount > collectionsReturned;

  return (
    <Flex direction='column' gap={8}>
      <InnerPageHeader
        title='Catalog'
        overline='Browsing'
        actions={
          <Button
            as={SmartLink}
            to='/collections/new'
            colorScheme='primary'
            size='md'
            leftIcon={<CollecticonPlusSmall />}
          >
            Create
          </Button>
        }
      />
      <Flex direction='column' gap='8' as='section'>
        <Flex direction='row' px='8' gap='8' as='header'>
          <Box flexBasis='100%'>
            <Heading size='md' as='h2'>
              Collections{' '}
              {!!collectionsCount && (
                <Badge variant='solid'>{zeroPad(collectionsCount)}</Badge>
              )}
            </Heading>
          </Box>
          <Flex direction='row' gap='4'>
            <Flex direction='row' gap='2' alignItems='center'>
              <Heading size='xs' as='h3'>
                Search
              </Heading>
              <InputGroup width='16rem'>
                <Input
                  type='search'
                  placeholder='Title or description'
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputRightElement pointerEvents='none'>
                  <CollecticonMagnifierRight />
                </InputRightElement>
              </InputGroup>
            </Flex>
            <Flex direction='row' gap='2' alignItems='center'>
              <Heading size='xs' as='h3'>
                Filter
              </Heading>
              <Select
                placeholder='All keywords'
                size='md'
                width='12rem'
                onChange={(e) => setKeyword(e.target.value)}
              >
                {keywords.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>
        </Flex>

        <SimpleGrid
          gap={8}
          templateColumns='repeat(auto-fill, minmax(26rem, 1fr))'
        >
          {!collections || state === 'LOADING' ? (
            <>
              <ItemCardLoading />
              <ItemCardLoading />
            </>
          ) : (
            filteredCollections.map((col) => (
              <ItemCard
                key={col.id}
                imageSrc={col.assets?.thumbnail?.href}
                imageAlt={col.assets?.thumbnail?.title}
                title={col.title || col.id}
                description={col.description}
                tags={col.keywords}
                to={`/collections/${col.id}/`}
                renderMenu={() => (
                  <Menu placement='bottom-end'>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<CollecticonEllipsisVertical />}
                      variant='soft-outline'
                      colorScheme='base'
                      size='sm'
                    />
                    <MenuList>
                      <MenuItem
                        as={SmartLink}
                        to={`/collections/${col.id}/`}
                        icon={<CollecticonTextBlock />}
                      >
                        View
                      </MenuItem>
                      <MenuItem
                        as={SmartLink}
                        to={`/collections/${col.id}/edit`}
                        icon={<CollecticonPencil />}
                      >
                        Edit
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              />
            ))
          )}
        </SimpleGrid>
        {/* {shouldPaginate && (
          <Flex direction='column' alignItems='center'>
            <Pagination
              numPages={numPages}
              page={page}
              onPageChange={setPage}
            />
          </Flex>
        )} */}
      </Flex>
    </Flex>
  );
}

export default CollectionList;
