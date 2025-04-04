import React from 'react';
import { MenuItem, MenuItemProps } from '@chakra-ui/react';
import { CollecticonGlobe } from '@devseed-ui/collecticons-chakra';
import SmartLink from './SmartLink';

const baseStacBrowserUrl =
  process.env.REACT_APP_STAC_BROWSER ||
  `https://radiantearth.github.io/stac-browser/#/external/${process.env.REACT_APP_STAC_API}`;

export function StacBrowserMenuItem(
  props: MenuItemProps & { resourcePath: string }
) {
  const { resourcePath, ...rest } = props;
  return (
    <MenuItem
      icon={<CollecticonGlobe />}
      as={SmartLink}
      to={`${baseStacBrowserUrl}${resourcePath}`}
      {...rest}
    >
      View in STAC Browser
    </MenuItem>
  );
}
