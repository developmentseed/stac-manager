import React from 'react';
import { List, ListItem, Button, ButtonProps, Flex } from '@chakra-ui/react';
import {
  CollecticonFolder,
  CollecticonPlusSmall
} from '@devseed-ui/collecticons-chakra';

import SmartLink, { SmartLinkProps } from './SmartLink';
import { UserInfo } from './auth/UserInfo';
import { useAuth0 } from '@auth0/auth0-react';

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
  const { isAuthenticated } = useAuth0();

  return (
    <Flex as='nav' aria-label='Main' gap={8}>
      <List display='flex' gap={2}>
        <NavItem to='/collections/' leftIcon={<CollecticonFolder />}>
          Browse
        </NavItem>
        {isAuthenticated && (
          <NavItem to='/collections/new' leftIcon={<CollecticonPlusSmall />}>
            Create
          </NavItem>
        )}
      </List>
      <UserInfo />
    </Flex>
  );
}

export default MainNavigation;
