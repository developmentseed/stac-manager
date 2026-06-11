import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Separator,
  Image
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { Route, Routes } from 'react-router-dom';
import {
  CollecticonCog,
  CollecticonHeart
} from '@devseed-ui/collecticons-chakra';

import { RequireAuth } from '$components/auth/RequireAuth';
import MainNavigation from '$components/MainNavigation';
import Home from '$pages/Home';
import CollectionList from '$pages/CollectionList';
import { CollectionForm } from '$pages/CollectionForm';
import ItemDetail from '$pages/ItemDetail';
import NotFound from '$pages/NotFound';
import CollectionDetail from '$pages/CollectionDetail';
import Sandbox from '$pages/Sandbox';
import TestJsonEditor from '$pages/TestJsonEditor';

import { useAuth } from './auth/Context';
import SmartLink from '$components/SmartLink';

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
  const { isLoading } = useAuth();

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Flex
              minW='100vw'
              minH='100vh'
              bg='white'
              align='center'
              justify='center'
            >
              <CollecticonCog
                boxSize='5em'
                color='base.300'
                animation={`${rotate} 4s linear infinite`}
              />
              <CollecticonCog
                ml={-2}
                boxSize='5em'
                color='base.300'
                animation={`${rotate2} 4s linear infinite reverse`}
              />
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && (
        <Container
          maxW='7xl'
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
                src={`${(process.env.PUBLIC_URL || '').replace(/\/+$/, '')}/meta/icon-512.png`}
                width={8}
                aspectRatio={1}
                borderRadius='md'
              />
              <Separator
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
              {/* Playwright harness — dev server only, not in production. */}
              {process.env.NODE_ENV !== 'production' && (
                <Route path='/test-jsoneditor' element={<TestJsonEditor />} />
              )}
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
      <Flex gap={4} alignItems='center' width='100%'>
        <Text as='span'>
          Powered by{' '}
          <strong>
            STAC Manager{' '}
            <Badge bg='base.400a' color='surface.500' px='0.375rem'>
              {process.env.APP_VERSION}
            </Badge>
          </strong>{' '}
        </Text>
        <Separator orientation='vertical' borderColor='base.200a' h='1em' />
        {new Date().getFullYear()}
        <Text as='span' ml='auto'>
          Made with <CollecticonHeart meaningful title='love' /> by{' '}
          <SmartLink to='https://developmentseed.org' color='inherit'>
            Development Seed
          </SmartLink>
          .
        </Text>
      </Flex>
    </Flex>
  );
}
