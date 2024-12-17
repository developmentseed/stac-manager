import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  ListItem,
  Text,
  List,
  Tag,
  Icon,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { MdAccessTime, MdBalance, MdEdit } from 'react-icons/md';
import { useCollection, useStacSearch } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonGlobe,
  CollecticonPencil,
  CollecticonTrashBin
} from '@devseed-ui/collecticons-chakra';
import { StacCollection } from 'stac-ts';

import { Loading } from '../../components';
import { usePageTitle } from '../../hooks';
import ItemResults from '../../components/ItemResults';
import CollectionMap from './CollectionMap';
import SmartLink from '$components/SmartLink';
import { InnerPageHeader } from '$components/InnerPageHeader';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

function CollectionDetail() {
  const { collectionId } = useParams();
  usePageTitle(`Collection ${collectionId}`);
  const { collection, state } = useCollection(collectionId!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

  const { results, collections, setCollections, submit, ...stacSearch } =
    useStacSearch();

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
    return <Loading>Loading collection...</Loading>;
  }

  const { id, title, description, keywords, license } =
    collection as StacCollection;

  return (
    <Flex direction='column' gap={8} p={4}>
      <InnerPageHeader
        overline='Viewing Collection'
        title={id}
        actions={
          <>
            <Button
              as={SmartLink}
              to={`/collections/${id}/edit`}
              colorScheme='primary'
              size='sm'
              leftIcon={<CollecticonPencil />}
            >
              Edit
            </Button>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<CollecticonEllipsisVertical />}
                variant='outline'
                size='sm'
              />
              <MenuList>
                <MenuItem
                  icon={<CollecticonGlobe />}
                  as={SmartLink}
                  to={`${process.env.REACT_APP_STAC_BROWSER}/stac/collections/${id}`}
                >
                  View in STAC Browser
                </MenuItem>
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
      <Box
        display='grid'
        gap='8'
        gridTemplateColumns='2fr 1fr'
        borderBottom='1px solid'
        borderColor='gray.200'
        pb='8'
      >
        <Box height='250px'>
          <CollectionMap collection={collection} />
        </Box>
        <Box fontSize='sm'>
          <Box display='flex' gap='4' alignItems='baseline'>
            <Text as='h2' fontSize='md' my='0' flex='1'>
              About
            </Text>
            <Link to='edit/' title='Edit collection'>
              <Icon as={MdEdit} boxSize='4' />
            </Link>
          </Box>
          {(title || description) && (
            <Text mt='0'>
              {title && <Text as='b'>{title} </Text>}
              {description}
            </Text>
          )}
          <Box color='gray.600' my='4'>
            <Box display='flex' gap='1' alignItems='center' mb='1'>
              <Icon color='gray.600' as={MdAccessTime} boxSize='4' />
              <Text m='0'>{dateLabel}</Text>
            </Box>
            <Box display='flex' gap='1' alignItems='center' mb='1'>
              <Icon color='gray.600' as={MdBalance} boxSize='4' />
              <Text m='0'>{license}</Text>
            </Box>
          </Box>
          {keywords && keywords.length > 0 && (
            <List mt='1'>
              {keywords.map((keyword) => (
                <Tag mr='1' as={ListItem} key={keyword}>
                  {keyword}
                </Tag>
              ))}
            </List>
          )}
        </Box>
      </Box>

      <Text as='h2'>Items in this collection</Text>
      <ItemResults results={results} submit={submit} {...stacSearch} />
    </Flex>
  );
}

export default CollectionDetail;
