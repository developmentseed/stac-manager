import React from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal,
  SimpleGrid
} from '@chakra-ui/react';
import { StacAsset } from 'stac-ts';
import StacFields from '@radiantearth/stac-fields';
import {
  CollecticonEllipsisVertical,
  CollecticonLink
} from '@devseed-ui/collecticons-chakra';
import { zeroPad } from '$utils/format';
import { ItemCard } from '$components/ItemCard';
import SmartLink from '$components/SmartLink';

type AssetProps = {
  assetKey: string;
  asset: StacAsset & {
    alternate?: { [key: string]: Alternate };
  };
};

type Alternate = {
  href: string;
  title?: string;
  description?: string;
};

function Asset({ asset, assetKey }: AssetProps) {
  const { title, description, roles, type, href, alternate } = asset;
  const formattedProperties = StacFields.formatAsset({ type })[0].properties;

  return (
    <ItemCard
      title={title || assetKey}
      subtitle={formattedProperties.type.formatted}
      description={description}
      tags={roles}
      renderMenu={() => {
        return alternate ? (
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <IconButton
                aria-label='Download options'
                variant='outline'
                size='sm'
              >
                <CollecticonEllipsisVertical />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {Object.entries(alternate).map(
                    ([key, val]: [string, Alternate]) => (
                      <Menu.Item key={key} value={key} asChild>
                        <SmartLink to={val.href}>
                          {val.title || val.href}
                        </SmartLink>
                      </Menu.Item>
                    )
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        ) : (
          <IconButton
            as={SmartLink}
            // @ts-expect-error: forwarding `to` to SmartLink via `as` polymorphism
            to={href}
            aria-label='Download'
            variant='outline'
            size='sm'
          >
            <CollecticonLink />
          </IconButton>
        );
      }}
    />
  );
}

type AssetListProps = {
  assets: { [key: string]: StacAsset };
};

function AssetList({ assets }: AssetListProps) {
  const assetsList = Object.entries(assets);
  return (
    <Flex direction='column' gap='8' as='section'>
      <Flex direction='row' px='8' gap='8' as='header'>
        <Box flexBasis='100%'>
          <Heading size='md' as='h2'>
            Assets <Badge variant='solid'>{zeroPad(assetsList.length)}</Badge>
          </Heading>
        </Box>
      </Flex>

      <SimpleGrid
        gap={8}
        templateColumns='repeat(auto-fill, minmax(20rem, 1fr))'
      >
        {assetsList.map(([key, asset]) => (
          <Asset key={key} asset={asset} assetKey={key} />
        ))}
      </SimpleGrid>
    </Flex>
  );
}

export default AssetList;
