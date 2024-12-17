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
  Divider
} from '@chakra-ui/react';
import { StacApiProvider } from '@developmentseed/stac-react';
import { PluginConfigProvider } from '@stac-manager/data-core';

import theme from './theme';
import { MainNavigation } from './components';
import Home from './pages/Home';
import CollectionList from './pages/CollectionList';
import { CollectionForm } from './pages/CollectionForm';
import ItemList from './pages/ItemList';
import ItemDetail from './pages/ItemDetail';
import ItemForm from './pages/ItemForm';
import NotFound from './pages/NotFound';
import CollectionDetail from './pages/CollectionDetail';
import { config } from './plugin-system/config';

export const App = () => (
  <ChakraProvider theme={theme}>
    <StacApiProvider apiUrl={process.env.REACT_APP_STAC_API!}>
      <PluginConfigProvider config={config}>
        <Router>
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
                <Route path='/collections/new/' element={<CollectionForm />} />
                <Route
                  path='/collections/:collectionId/'
                  element={<CollectionDetail />}
                />
                <Route
                  path='/collections/:collectionId/edit/'
                  element={<CollectionForm />}
                />
                <Route path='/items/' element={<ItemList />} />
                <Route
                  path='/collections/:collectionId/items/:itemId/'
                  element={<ItemDetail />}
                />
                <Route
                  path='/collections/:collectionId/items/:itemId/edit/'
                  element={<ItemForm />}
                />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Box>
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
