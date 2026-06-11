import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Formik } from 'formik';
import { SchemaFieldArray, SchemaFieldString } from '@stac-manager/data-core';

import { WidgetCheckbox } from './checkbox';

const field: SchemaFieldArray<SchemaFieldString> = {
  type: 'array',
  label: 'Toppings',
  items: {
    type: 'string',
    enum: [
      ['cheese', 'Cheese'],
      ['olives', 'Olives'],
      ['mushrooms', 'Mushrooms']
    ]
  }
};

const renderWidget = (
  onSubmit = jest.fn(),
  initialValues: Record<string, string[]> = {}
) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        <WidgetCheckbox pointer='toppings' field={field} isRequired />
      </Formik>
    </ChakraProvider>
  );

describe('WidgetCheckbox', () => {
  // Regression: with the group under a single Field.Root, every checkbox
  // inherited the Field's ids (duplicate DOM ids, all labels pointing at the
  // first input) and its `required` flag.
  it('gives every checkbox its own id and label association', () => {
    renderWidget();

    const inputs = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(3);

    const ids = inputs.map((input) => input.id);
    expect(new Set(ids).size).toBe(3);

    ['Cheese', 'Olives', 'Mushrooms'].forEach((label, i) => {
      const labelEl = screen.getByText(label).closest('label');
      expect(labelEl).toHaveAttribute('for', ids[i]);
    });
  });

  it('does not stamp required onto the individual checkboxes', () => {
    renderWidget();

    screen.getAllByRole('checkbox').forEach((input) => {
      expect(input).not.toBeRequired();
    });
    // The group label still shows the required indicator.
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('toggles only the clicked option', () => {
    renderWidget();

    const inputs = screen.getAllByRole('checkbox') as HTMLInputElement[];
    fireEvent.click(screen.getByText('Olives'));

    expect(inputs[0]).not.toBeChecked();
    expect(inputs[1]).toBeChecked();
    expect(inputs[2]).not.toBeChecked();
  });
});
