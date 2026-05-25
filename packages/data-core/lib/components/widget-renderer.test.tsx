import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import { WidgetRenderer } from './widget-renderer';
import { usePluginConfig } from '../context/plugin-config';
import { SchemaField } from '../schema/types';

jest.mock('../context/plugin-config', () => ({
  usePluginConfig: jest.fn()
}));

const mockPluginConfig = {
  'ui:widget': {
    text: ({ pointer }: { pointer: string }) => (
      <div>Text Widget: {pointer}</div>
    ),
    number: ({ pointer }: { pointer: string }) => (
      <div>Number Widget: {pointer}</div>
    ),
    radio: ({ pointer }: { pointer: string }) => (
      <div>Radio Widget: {pointer}</div>
    ),
    broken: () => {
      throw new Error('Widget failed');
    }
  }
};

describe('WidgetRenderer', () => {
  beforeEach(() => {
    (usePluginConfig as jest.Mock).mockReturnValue(mockPluginConfig);
  });

  it('renders a text widget', () => {
    const field: SchemaField = { type: 'string' };
    render(<WidgetRenderer pointer='test.pointer' field={field} />);
    expect(screen.getByText('Text Widget: test.pointer')).toBeInTheDocument();
  });

  it('renders a number widget', () => {
    const field: SchemaField = { type: 'number' };
    render(<WidgetRenderer pointer='test.pointer' field={field} />);
    expect(screen.getByText('Number Widget: test.pointer')).toBeInTheDocument();
  });

  it('renders a radio widget for enum strings', () => {
    const field: SchemaField = {
      type: 'string',
      enum: [
        ['option1', 'Option 1'],
        ['option2', 'Option 2']
      ]
    };
    render(<WidgetRenderer pointer='test.pointer' field={field} />);
    expect(screen.getByText('Radio Widget: test.pointer')).toBeInTheDocument();
  });

  it('renders an error box when widget is not found', () => {
    const field: SchemaField = { type: 'string', 'ui:widget': 'custom' };
    render(
      <ChakraProvider value={defaultSystem}>
        <WidgetRenderer pointer='test.pointer' field={field} />
      </ChakraProvider>
    );
    expect(screen.getByText('Widget "custom" not found')).toBeInTheDocument();
  });

  it('renders error boundary when widget throws an error', () => {
    // The test will pass but there will be some noise in the output:
    // Error: Uncaught [Error: Widget failed]
    // So we need to spyOn the console error:
    jest.spyOn(console, 'error').mockImplementation(() => null);

    const field: SchemaField = { type: 'string', 'ui:widget': 'broken' };
    render(
      <ChakraProvider value={defaultSystem}>
        <WidgetRenderer pointer='test.pointer' field={field} />
      </ChakraProvider>
    );
    expect(
      screen.getByText('💔 Error rendering widget (broken)')
    ).toBeInTheDocument();
    expect(screen.getByText('Widget failed')).toBeInTheDocument();

    // Restore the original console.error to avoid affecting other tests.
    jest.spyOn(console, 'error').mockRestore();
  });
});
