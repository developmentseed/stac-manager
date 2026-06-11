import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import { getArrayLabel } from './index';
import { SchemaField } from '@stac-manager/data-core';

// Snapshotting a raw React element broke under React 19 (pretty-format's
// ReactElement plugin no longer recognizes Symbol(react.transitional.element)
// and falls back to printing the raw element internals). Render the formatted
// node to DOM and snapshot the resulting markup instead.
const renderFormatted = (node: React.ReactNode) => {
  const props: React.ComponentProps<typeof ChakraProvider> = {
    value: defaultSystem,
    children: node
  };
  return render(React.createElement(ChakraProvider, props)).container;
};

describe('getArrayLabel', () => {
  it('should return a label with a number suffix for string labels', () => {
    const field: SchemaField = { label: 'Label' } as any;
    const result = getArrayLabel(field, 9);

    expect(result).toEqual({
      label: 'Label',
      num: 10, // 1-based index
      formatted: expect.anything()
    });
    expect(renderFormatted(result?.formatted)).toMatchSnapshot();
  });

  it('should cycle through array labels based on index', () => {
    const field: SchemaField = { label: ['One', 'Two', 'Three'] } as any;
    expect(getArrayLabel(field, 0)?.label).toBe('One');
    expect(getArrayLabel(field, 3)?.label).toBe('One');
    expect(getArrayLabel(field, 4)?.label).toBe('Two');
  });

  it('should return null if label is null', () => {
    const field: SchemaField = { label: null } as any;
    expect(getArrayLabel(field, 0)).toBeNull();
  });

  it('should return Item if label is undefined', () => {
    const field: SchemaField = { label: undefined } as any;
    const result = getArrayLabel(field, 0);

    expect(result).toEqual({
      label: 'Item',
      num: 1,
      formatted: expect.anything()
    });
    expect(renderFormatted(result?.formatted)).toMatchSnapshot();
  });
});
