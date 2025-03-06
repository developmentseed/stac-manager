import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Divider,
  Fade
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { CollecticonCog } from '@devseed-ui/collecticons-chakra';

import { MainNavigation } from './components';
import { RequireAuth } from '$components/auth/RequireAuth';
import Home from '$pages/Home';
import CollectionList from '$pages/CollectionList';
import { CollectionForm } from '$pages/CollectionForm';
import ItemDetail from '$pages/ItemDetail';
import NotFound from '$pages/NotFound';
import CollectionDetail from '$pages/CollectionDetail';
import Sandbox from '$pages/Sandbox';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const rotate2 = keyframes`
  from {
    transform: rotate(22.5deg);
  }
  to {
    transform: rotate(382.5deg);
  }
`;

export function App() {
  const { isLoading } = useAuth0();

  return (
    <>
      <Fade in={isLoading} unmountOnExit>
        <Flex
          minW='100vw'
          minH='100vh'
          bg='white'
          align='center'
          justify='center'
        >
          <CollecticonCog
            size='5em'
            color='base.300'
            animation={`${rotate} 4s linear infinite`}
          />
          <CollecticonCog
            ml={-2}
            size='5em'
            color='base.300'
            animation={`${rotate2} 4s linear infinite reverse`}
          />
        </Flex>
      </Fade>
      {!isLoading && (
        <Container
          maxW='container.lg'
          minH='100vh'
          display='flex'
          flexDirection='column'
        >
          <Flex
            as='header'
            gap={4}
            alignItems='center'
            justifyContent='space-between'
            p={4}
          >
            <Heading as='p' size='sm'>
              STAC Manager
            </Heading>

            <MainNavigation />
          </Flex>
          <Box as='main'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/collections/' element={<CollectionList />} />
              <Route
                path='/collections/new/'
                element={<RequireAuth Component={CollectionForm} />}
              />
              <Route
                path='/collections/:collectionId/'
                element={<CollectionDetail />}
              />
              <Route
                path='/collections/:collectionId/edit/'
                element={<RequireAuth Component={CollectionForm} />}
              />
              <Route
                path='/collections/:collectionId/items/:itemId/'
                element={<ItemDetail />}
              />
              <Route path='/sandbox' element={<Sandbox />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Box>
          <AppFooter />
        </Container>
      )}
    </>
  );
}

function AppFooter() {
  return (
    <Flex
      as='footer'
      gap={4}
      alignItems='center'
      justifyContent='space-between'
      mt='auto'
      p={4}
    >
      <Flex gap={4} alignItems='center'>
        <Text as='span'>
          Powered by{' '}
          <strong>
            STAC Manager{' '}
            <Badge bg='base.400a' color='surface.500' px='0.375rem'>
              {process.env.APP_VERSION}
            </Badge>
          </strong>{' '}
        </Text>
        <Divider orientation='vertical' borderColor='base.200a' h='1em' />
        {new Date().getFullYear()}
      </Flex>
    </Flex>
  );
}
