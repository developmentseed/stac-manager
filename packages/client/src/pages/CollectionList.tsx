import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TableContainer,
  Table,
  Button,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Flex
} from '@chakra-ui/react';
import { CollecticonPlusSmall } from '@devseed-ui/collecticons-chakra';
import { useCollections } from '@developmentseed/stac-react';
import type { StacCollection } from 'stac-ts';

import { Loading } from '../components';
import { usePageTitle } from '../hooks';
import { InnerPageHeader } from '$components/InnerPageHeader';
import SmartLink from '$components/SmartLink';

function CollectionList() {
  usePageTitle('Collections');
  const navigate = useNavigate();
  const { collections, state } = useCollections();

  return (
    <Flex direction='column' gap={8} p={4}>
      <InnerPageHeader
        title='Catalog'
        overline='Browsing'
        actions={
          <Button
            as={SmartLink}
            to='/collections/new'
            colorScheme='primary'
            size='sm'
            leftIcon={<CollecticonPlusSmall />}
          >
            Create
          </Button>
        }
      />
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th aria-label='Actions' />
            </Tr>
          </Thead>
          <Tbody>
            {!collections || state === 'LOADING' ? (
              <Tr>
                <Td colSpan={2}>
                  <Loading>Loading collections...</Loading>
                </Td>
              </Tr>
            ) : (
              collections.collections.map(({ id }: StacCollection) => (
                <Tr
                  key={id}
                  onClick={() => navigate(`/collections/${id}/`)}
                  _hover={{ cursor: 'pointer', bgColor: 'gray.50' }}
                >
                  <Td>{id}</Td>
                  <Td fontSize='sm'>
                    <Link
                      to={`/collections/${id}/`}
                      aria-label={`View collection ${id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>{' '}
                    |{' '}
                    <Link
                      to={`/collections/${id}/edit/`}
                      aria-label={`Edit collection ${id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export default CollectionList;
