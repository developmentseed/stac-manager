import React from 'react';
import { Menu, MenuItemProps } from '@chakra-ui/react';
import { CollecticonGlobe } from '@devseed-ui/collecticons-chakra';
import SmartLink from './SmartLink';

const baseStacBrowserUrl =
  process.env.REACT_APP_STAC_BROWSER ||
  `https://radiantearth.github.io/stac-browser/#/external/${process.env.REACT_APP_STAC_API}`;

export function StacBrowserMenuItem(
  props: Omit<MenuItemProps, 'value'> & { resourcePath: string; value?: string }
) {
  const { resourcePath, value, ...rest } = props;
  return (
    <Menu.Item value={value ?? 'stac-browser'} {...rest} asChild>
      <SmartLink to={`${baseStacBrowserUrl}${resourcePath}`}>
        <CollecticonGlobe />
        View in STAC Browser
      </SmartLink>
    </Menu.Item>
  );
}
