import React from 'react';
import { List, Button, ButtonProps, Flex, Separator } from '@chakra-ui/react';
import {
  CollecticonFolder,
  CollecticonPlusSmall
} from '@devseed-ui/collecticons-chakra';

import SmartLink, { SmartLinkProps } from './SmartLink';
import { UserInfo } from './auth/UserInfo';
import { useAuth } from 'src/auth/Context';

function NavItem(props: ButtonProps & SmartLinkProps) {
  return (
    <List.Item>
      <Button
        as={SmartLink}
        variant='ghost'
        css={{
          '&:hover': {
            textDecoration: 'none'
          }
        }}
        {...props}
      />
    </List.Item>
  );
}

function MainNavigation() {
  const { isEnabled, isAuthenticated } = useAuth();

  return (
    <Flex as='nav' aria-label='Main' gap={4} alignItems='center'>
      <List.Root flexDirection='row' gap={2} listStyle='none'>
        <NavItem to='/collections/'>
          Browse
          <CollecticonFolder />
        </NavItem>
        {isAuthenticated && (
          <NavItem to='/collections/new'>
            Create
            <CollecticonPlusSmall />
          </NavItem>
        )}
      </List.Root>
      {isEnabled && (
        <>
          <Separator
            orientation='vertical'
            borderLeftWidth='2px'
            borderColor='base.200'
            h='1rem'
          />
          <UserInfo />
        </>
      )}
    </Flex>
  );
}

export default MainNavigation;
