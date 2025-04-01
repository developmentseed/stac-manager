import React from 'react';
import {
  List,
  ListItem,
  Button,
  ButtonProps,
  Flex,
  Divider
} from '@chakra-ui/react';
import {
  CollecticonFolder,
  CollecticonPlusSmall
} from '@devseed-ui/collecticons-chakra';

import SmartLink, { SmartLinkProps } from './SmartLink';
import { UserInfo } from './auth/UserInfo';
import { useKeycloak } from 'src/auth/Context';

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
  const { keycloak, isEnabled } = useKeycloak();

  return (
    <Flex as='nav' aria-label='Main' gap={4} alignItems='center'>
      <List display='flex' gap={2}>
        <NavItem to='/collections/' rightIcon={<CollecticonFolder />}>
          Browse
        </NavItem>
        {keycloak?.authenticated && (
          <NavItem to='/collections/new' rightIcon={<CollecticonPlusSmall />}>
            Create
          </NavItem>
        )}
      </List>
      {isEnabled && (
        <>
          <Divider
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
