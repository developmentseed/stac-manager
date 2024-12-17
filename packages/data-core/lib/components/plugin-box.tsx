import React from 'react';
import { Code } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import { PluginProvider } from '../context/plugin';
import { Plugin } from '../plugin-utils/plugin';
import { ErrorBox } from './error-box';
import { SchemaField } from '../schema/types';

interface PluginBoxProps {
  plugin: Plugin;
  children: ({ field }: { field: SchemaField }) => JSX.Element;
}

/**
 * Prepares the plugin schema and sets up the plugin context.
 * Provides the plugin schema to the children function.
 *
 * @param props.plugin The plugin to render
 * @param props.children The children function to render the plugin schema.
 */
export function PluginBox(props: PluginBoxProps) {
  const { plugin, children } = props;

  const { values } = useFormikContext();
  const editSchema = plugin.editSchema(values);

  if (!editSchema) {
    return (
      <ErrorBox>
        Plugin <Code color='red'>{plugin.name}</Code> has no edit schema.
      </ErrorBox>
    );
  }

  if (editSchema === Plugin.HIDDEN) {
    return null;
  }

  return (
    <PluginProvider plugin={plugin}>
      {children({ field: editSchema as SchemaField })}
    </PluginProvider>
  );
}
