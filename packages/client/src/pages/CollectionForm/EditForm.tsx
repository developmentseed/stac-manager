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
import { inspectBbox } from '$utils/bbox';

type FormView = 'fields' | 'json';

// The generic schema → Yup validation only knows each bbox corner is a number;
// it can't express the geographic rules (ranges, ordering, zero-area). Build
// Formik errors for `values.spatial` (number[][]) keyed at spatial.<i>.<corner>
// so they render inline on the offending coordinate input.
function buildSpatialErrors(values: any): { spatial: any[] } | undefined {
  const spatial = values?.spatial;
  if (!Array.isArray(spatial)) return undefined;

  const spatialErrors: any[] = [];
  let hasError = false;
  spatial.forEach((bbox: unknown, i: number) => {
    const issues = inspectBbox(bbox);
    if (!issues.length) return;
    const row: (string | undefined)[] = [];
    // First issue per corner wins — enough to point the user at the field.
    issues.forEach(({ index, message }) => {
      if (row[index] === undefined) row[index] = message;
    });
    spatialErrors[i] = row;
    hasError = true;
  });

  return hasError ? { spatial: spatialErrors } : undefined;
}

// Deep-merge two Formik error trees. `base` (schema errors) wins on a leaf
// conflict so a "must be a number" isn't clobbered by a range message; `extra`
// (bbox errors) fills the gaps. Returns undefined when both are empty.
function mergeErrors(base: any, extra: any): any {
  if (extra === undefined || extra === null) return base ?? undefined;
  if (base === undefined || base === null) return extra;
  if (typeof base === 'string' || typeof extra === 'string') return base;

  const out: any = Array.isArray(base) || Array.isArray(extra) ? [] : {};
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);
  keys.forEach((key) => {
    out[key] = mergeErrors(base[key], extra[key]);
  });
  return out;
}

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
    [view, formData, stacData]
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

              const [, schemaError] = validatePluginsFieldsData(
                plugins,
                values
              );
              const merged = mergeErrors(
                schemaError,
                buildSpatialErrors(values)
              );
              if (merged) return merged;
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
                        disabled={isSubmitting}
                        colorPalette='primary'
                        size='md'
                      >
                        <CollecticonTickSmall />
                        {initialData ? 'Save' : 'Create'}
                      </Button>
                    </Flex>
                  }
                />
                <Flex alignItems='center' justifyContent='space-between' px={8}>
                  <Heading size='md' as='h2'>
                    {initialData ? 'Edit' : 'New'}
                  </Heading>

                  <ButtonGroup attached variant='outline' size='md'>
                    <Button
                      aria-label='Edit Form'
                      onClick={() => {
                        if (view === 'fields') return;
                        setView('fields');
                        setStacData(values.jsonData);
                      }}
                      data-active={view === 'fields' ? '' : undefined}
                    >
                      <CollecticonForm />
                      Form
                    </Button>
                    <Button
                      aria-label='Edit JSON'
                      onClick={() => {
                        if (view === 'json') return;
                        setView('json');
                        setStacData(toOutData(values));
                      }}
                      data-active={view === 'json' ? '' : undefined}
                    >
                      <CollecticonCode />
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
