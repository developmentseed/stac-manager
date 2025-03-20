import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Divider,
  Image
} from '@chakra-ui/react';
import { StacApiProvider } from '@developmentseed/stac-react';
import { PluginConfigProvider } from '@stac-manager/data-core';

import theme from './theme/theme';
import { MainNavigation } from './components';
import Home from './pages/Home';
import CollectionList from './pages/CollectionList';
import { CollectionForm } from './pages/CollectionForm';
import ItemDetail from './pages/ItemDetail';
import NotFound from './pages/NotFound';
import CollectionDetail from './pages/CollectionDetail';
import Sandbox from './pages/Sandbox';
import { config } from './plugin-system/config';

let basename: string | undefined;
if (process.env.PUBLIC_URL) {
  try {
    basename = new URL(process.env.PUBLIC_URL).pathname;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // no-op
  }
}

export const App = () => (
  <ChakraProvider theme={theme}>
    <StacApiProvider apiUrl={process.env.REACT_APP_STAC_API!}>
      <PluginConfigProvider config={config}>
        <Router basename={basename}>
          <Container
            maxW='container.xl'
            minH='100vh'
            display='flex'
            flexDirection='column'
            gap={4}
          >
            <Flex
              as='header'
              gap={4}
              alignItems='center'
              justifyContent='space-between'
              py={8}
            >
              <Flex gap={4} alignItems='center'>
                <Image
                  src={`${process.env.PUBLIC_URL}/meta/icon-512.png`}
                  width={8}
                  aspectRatio={1}
                  borderRadius='md'
                />
                <Divider
                  orientation='vertical'
                  borderColor='base.200a'
                  h='1rem'
                  borderLeftWidth='2px'
                />
                <Heading as='p' size='sm'>
                  STAC Manager
                </Heading>
              </Flex>

              <MainNavigation />
            </Flex>
            <Box as='main'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/collections/' element={<CollectionList />} />
                <Route path='/collections/new/' element={<CollectionForm />} />
                <Route
                  path='/collections/:collectionId/'
                  element={<CollectionDetail />}
                />
                <Route
                  path='/collections/:collectionId/edit/'
                  element={<CollectionForm />}
                />
                <Route
                  path='/collections/:collectionId/items/:itemId/'
                  element={<ItemDetail />}
                />
                <Route path='/sandbox' element={<Sandbox />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Box>
            <Flex
              as='footer'
              gap={4}
              alignItems='center'
              justifyContent='space-between'
              mt='auto'
              py={8}
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
                <Divider
                  orientation='vertical'
                  borderColor='base.200a'
                  h='1em'
                />
                {new Date().getFullYear()}
              </Flex>
            </Flex>
          </Container>
        </Router>
      </PluginConfigProvider>
    </StacApiProvider>
  </ChakraProvider>
);
