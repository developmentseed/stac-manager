import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Icon,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';
import Map, { Source, Layer, MapRef } from 'react-map-gl/maplibre';
import StacFields from '@radiantearth/stac-fields';
import { StacAsset } from 'stac-ts';
import { useItem } from '@developmentseed/stac-react';
import {
  CollecticonEllipsisVertical,
  CollecticonGlobe,
  CollecticonPencil,
  CollecticonTrashBin
} from '@devseed-ui/collecticons-chakra';
import getBbox from '@turf/bbox';

import { usePageTitle } from '../../hooks';
import { Loading } from '../../components';
import PropertyList from './PropertyList';
import { PropertyGroup } from '../../types';
import { BackgroundTiles } from '../../components/Map';
import AssetList from './AssetList';
import { InnerPageHeader } from '$components/InnerPageHeader';
import SmartLink from '$components/SmartLink';

const resultsOutline = {
  'line-color': '#C53030',
  'line-width': 2
};

const resultsFill = {
  'fill-color': '#C53030',
  'fill-opacity': 0.1
};

const cogMediaTypes = [
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff'
];

function ItemDetail() {
  const { collectionId, itemId } = useParams();
  usePageTitle(`Item ${itemId}`);
  const itemResource = `${process.env.REACT_APP_STAC_API}/collections/${collectionId}/items/${itemId}`;
  const { item, state } = useItem(itemResource);

  const [map, setMap] = useState<MapRef>();
  const setMapRef = (m: MapRef) => setMap(m);

  // Fit the map view around the current results bbox
  useEffect(() => {
    const bounds = item && getBbox(item);

    if (map && bounds) {
      const [x1, y1, x2, y2] = bounds;
      map.fitBounds([x1, y1, x2, y2], { padding: 30, duration: 0 });
    }
  }, [item, map]);

  const previewAsset = useMemo(() => {
    if (!item) return;

    return Object.values(item.assets).reduce((preview, asset) => {
      const { type, href, roles } = asset as StacAsset;
      if (cogMediaTypes.includes(type || '')) {
        if (!preview) {
          return href;
        } else {
          if (roles && roles.includes('visual')) {
            return href;
          }
        }
      }
      return preview;
    }, undefined);
  }, [item]);

  if (!item || state === 'LOADING') {
    return <Loading>Loading item...</Loading>;
  }

  const { title, description, ...properties } = item.properties;
  const formattedProperties = StacFields.formatItemProperties({ properties });

  return (
    <Flex direction='column' gap={8} p={4}>
      <InnerPageHeader
        overline='Viewing Item'
        title={title || properties.id}
        actions={
          <>
            <Button
              as={SmartLink}
              to={`/collections/${properties.collection}/items/${properties.id}/edit`}
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
                  to={`${process.env.REACT_APP_STAC_BROWSER}/stac/collections/${properties.collection}/items/${properties.id}/edit`}
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
      <Box display='grid' gridTemplateColumns='minmax(0, 2fr) 1fr' gap='8'>
        <Box>
          <Box
            height='60'
            borderBottom='1px solid'
            borderColor='gray.200'
            pb='8'
          >
            <Map
              ref={setMapRef}
              dragPan={false}
              scrollZoom={false}
              cursor='default'
            >
              <BackgroundTiles />
              {previewAsset && (
                <Source
                  id='preview'
                  type='raster'
                  tiles={[
                    `http://tiles.rdnt.io/tiles/{z}/{x}/{y}@2x?url=${previewAsset}`
                  ]}
                  tileSize={256}
                  attribution="Background tiles: © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
                >
                  <Layer id='preview-tiles' type='raster' />
                </Source>
              )}
              <Source id='results' type='geojson' data={item}>
                <Layer id='results-line' type='line' paint={resultsOutline} />
                {!previewAsset && (
                  <Layer id='results-fill' type='fill' paint={resultsFill} />
                )}
              </Source>
            </Map>
          </Box>
          <AssetList assets={item.assets} />
        </Box>
        <Box fontSize='sm' borderLeft='1px solid' borderColor='gray.100' pl='8'>
          <Box display='flex' gap='4' alignItems='baseline'>
            <Text as='h3' fontSize='md' my='0' flex='1'>
              About
            </Text>
            <Link to='edit/' title='Edit item'>
              <Icon as={MdEdit} boxSize='4' />
            </Link>
          </Box>
          {(title || description) && (
            <Text mt='0'>
              {title && <Text as='b'>{title} </Text>}
              {description}
            </Text>
          )}
          {formattedProperties.map((property: PropertyGroup) => (
            <PropertyList
              key={property.extension || 'default-props'}
              properties={property}
            />
          ))}
        </Box>
      </Box>
    </Flex>
  );
}

export default ItemDetail;
