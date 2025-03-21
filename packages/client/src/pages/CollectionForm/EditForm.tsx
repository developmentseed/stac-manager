import React, { useMemo, useState } from 'react';
import {
  PluginBox,
  useCollectionPlugins,
  validatePluginsFieldsData,
  WidgetRenderer,
  ScrollToInvalidField
} from '@stac-manager/data-core';
import { Box, Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react';
import { Formik, FormikHelpers } from 'formik';
import { WidgetJSON } from '@stac-manager/data-widgets';
import {
  CollecticonCode,
  CollecticonTickSmall
} from '@devseed-ui/collecticons-chakra';

import { InnerPageHeaderSticky } from '$components/InnerPageHeader';
import { CollecticonForm } from '$components/icons/form';
import { AppNotification, NotificationButton } from '$components/Notifications';

type FormView = 'fields' | 'json';

export function EditForm(props: {
  initialData?: any;
  onSubmit: (data: any, formikHelpers: FormikHelpers<any>) => void;
  notifications?: AppNotification[];
}) {
  const { initialData, onSubmit, notifications = [] } = props;
  const [stacData, setStacData] = useState(initialData || {});

  const { plugins, formData, toOutData, isLoading } =
    useCollectionPlugins(stacData);

  const [view, setView] = useState<FormView>('fields');

  const editorData = useMemo(
    () => (view === 'json' ? { jsonData: stacData } : formData),
    [view, formData]
  );

  return (
    <Box>
      {isLoading ? (
        <Box>Loading plugins...</Box>
      ) : (
        <Flex direction='column' gap={4}>
          <Formik
            validateOnChange={false}
            enableReinitialize
            initialValues={editorData}
            onSubmit={(values, actions) => {
              const exitData =
                view === 'json' ? values.jsonData : toOutData(values);
              return onSubmit(exitData, actions);
            }}
            validate={(values) => {
              if (view === 'json') return;

              const [, error] = validatePluginsFieldsData(plugins, values);
              if (error) return error;
            }}
          >
            {({ handleSubmit, values, isSubmitting }) => (
              <Flex
                as='form'
                direction='column'
                gap={8}
                // @ts-expect-error Can't detect the as=form and throws error
                onSubmit={handleSubmit}
              >
                <ScrollToInvalidField />
                <InnerPageHeaderSticky
                  overline={
                    initialData ? 'Editing Collection' : 'Creating Collection'
                  }
                  title={
                    initialData
                      ? initialData.title || initialData.id
                      : 'New Collection'
                  }
                  actions={
                    <Flex gap={4}>
                      <NotificationButton notifications={notifications} />
                      <Button
                        type='submit'
                        isDisabled={isSubmitting}
                        colorScheme='primary'
                        size='md'
                        leftIcon={<CollecticonTickSmall />}
                      >
                        {initialData ? 'Save' : 'Create'}
                      </Button>
                    </Flex>
                  }
                />
                <Flex alignItems='center' justifyContent='space-between' px={8}>
                  <Heading size='md' as='h2'>
                    {initialData ? 'Edit' : 'New'}
                  </Heading>

                  <ButtonGroup isAttached variant='outline' size='md'>
                    <Button
                      aria-label='Edit Form'
                      leftIcon={<CollecticonForm />}
                      onClick={() => {
                        setView('fields');
                        setStacData(values.jsonData);
                      }}
                      isActive={view === 'fields'}
                    >
                      Form
                    </Button>
                    <Button
                      aria-label='Edit JSON'
                      leftIcon={<CollecticonCode />}
                      onClick={() => {
                        setView('json');
                        setStacData(toOutData(values));
                      }}
                      isActive={view === 'json'}
                    >
                      JSON
                    </Button>
                  </ButtonGroup>
                </Flex>
                <Flex flexFlow='column' gap={4}>
                  {view === 'fields' ? (
                    plugins.map((pl) => (
                      <PluginBox key={pl.name} plugin={pl}>
                        {({ field }) => (
                          <Box
                            p='8'
                            borderRadius='lg'
                            bg='base.50a'
                            display='flex'
                            flexDir='column'
                            gap={8}
                          >
                            <Heading size='sm'>{pl.name}</Heading>
                            <WidgetRenderer pointer='' field={field} />
                          </Box>
                        )}
                      </PluginBox>
                    ))
                  ) : (
                    <WidgetJSON
                      field={{ type: 'json', label: 'Json Document' }}
                      pointer='jsonData'
                    />
                  )}
                </Flex>
              </Flex>
            )}
          </Formik>
        </Flex>
      )}
    </Box>
  );
}
