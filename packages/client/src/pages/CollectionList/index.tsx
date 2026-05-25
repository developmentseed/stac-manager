import React, { useMemo, useState } from 'react';
import {
  Flex,
  Heading,
  Box,
  SimpleGrid,
  InputGroup,
  Input,
  NativeSelect,
  Badge,
  Menu,
  IconButton,
  Portal
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
import { ButtonWithAuth } from '$components/auth/ButtonWithAuth';
import { MenuItemWithAuth } from '$components/auth/MenuItemWithAuth';
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
          <ButtonWithAuth colorPalette='primary' to='/collections/new'>
            <CollecticonPlusSmall />
            Create
          </ButtonWithAuth>
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
              <InputGroup
                width='16rem'
                endElement={<CollecticonMagnifierRight />}
              >
                <Input
                  type='search'
                  placeholder='Title or description'
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Flex>
            <Flex direction='row' gap='2' alignItems='center'>
              <Heading size='xs' as='h3'>
                Filter
              </Heading>
              <NativeSelect.Root size='md' width='12rem'>
                <NativeSelect.Field
                  placeholder='All keywords'
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setKeyword(e.target.value)
                  }
                >
                  {keywords.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
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
                showPlaceholder
                title={col.title || col.id}
                description={col.description}
                tags={col.keywords}
                to={`/collections/${col.id}/`}
                renderMenu={() => (
                  <Menu.Root positioning={{ placement: 'bottom-end' }}>
                    <Menu.Trigger asChild>
                      <IconButton
                        aria-label='Options'
                        variant={'soft-outline' as 'outline'}
                        colorPalette='base'
                        size='sm'
                      >
                        <CollecticonEllipsisVertical />
                      </IconButton>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value='view' asChild>
                            <SmartLink to={`/collections/${col.id}/`}>
                              <CollecticonTextBlock />
                              View
                            </SmartLink>
                          </Menu.Item>
                          <MenuItemWithAuth value='edit' asChild>
                            <SmartLink to={`/collections/${col.id}/edit`}>
                              <CollecticonPencil />
                              Edit
                            </SmartLink>
                          </MenuItemWithAuth>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
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
