import React from 'react';
import { Box, List, ListItem, Button, ButtonProps } from '@chakra-ui/react';
import {
  CollecticonFolder,
  CollecticonPlusSmall
} from '@devseed-ui/collecticons-chakra';

import SmartLink, { SmartLinkProps } from './SmartLink';

function NavItem(props: ButtonProps & SmartLinkProps) {
  return (
    <ListItem>
      <Button
        as={SmartLink}
        variant='ghost'
        sx={{
          '&:hover': {
            textDecoration: 'none'
          }
        }}
        {...props}
      />
    </ListItem>
  );
}

function MainNavigation() {
  return (
    <Box as='nav' aria-label='Main'>
      <List display='flex' gap={2}>
        <NavItem to='/collections/' leftIcon={<CollecticonFolder />}>
          Collections
        </NavItem>
        <NavItem to='/items/' leftIcon={<CollecticonFolder />}>
          Items
        </NavItem>
        <NavItem to='/collections/new' leftIcon={<CollecticonPlusSmall />}>
          Create
        </NavItem>
      </List>
    </Box>
  );
}

export default MainNavigation;
