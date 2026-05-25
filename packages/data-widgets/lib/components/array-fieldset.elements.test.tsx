import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ArrayFieldset } from './elements';

// Custom renderer to add context or providers if needed
const renderWithProviders = (
  ui: React.ReactNode,
  { renderOptions = {} } = {}
) => {
  // You can wrap the component with any context providers here
  return render(ui, {
    wrapper: ({ children }) => (
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    ),
    ...renderOptions
  });
};

describe('ArrayFieldset', () => {
  it('renders the label and children correctly', () => {
    renderWithProviders(
      <ArrayFieldset label='Test Label' isRequired>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = jest.fn();
    renderWithProviders(
      <ArrayFieldset label='Test Label' onRemove={onRemove}>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    const removeButton = screen.getByLabelText('Remove item');
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('disables the remove button when removeDisabled is true', () => {
    renderWithProviders(
      <ArrayFieldset label='Test Label' onRemove={() => {}} removeDisabled>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    const removeButton = screen.getByLabelText('Remove item');
    expect(removeButton).toBeDisabled();
  });

  it('calls onAdd when the add button is clicked', () => {
    const onAdd = jest.fn();
    renderWithProviders(
      <ArrayFieldset label='Test Label' onAdd={onAdd}>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    const addButton = screen.getByLabelText('Add item');
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('disables the add button when addDisabled is true', () => {
    renderWithProviders(
      <ArrayFieldset label='Test Label' onAdd={() => {}} addDisabled>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    const addButton = screen.getByLabelText('Add item');
    expect(addButton).toBeDisabled();
  });

  it('does not render the remove button when onRemove is not provided', () => {
    renderWithProviders(
      <ArrayFieldset label='Test Label'>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    expect(screen.queryByLabelText('Remove item')).not.toBeInTheDocument();
  });

  it('does not render the add button when onAdd is not provided', () => {
    renderWithProviders(
      <ArrayFieldset label='Test Label'>
        <div>Child Content</div>
      </ArrayFieldset>
    );

    expect(screen.queryByLabelText('Add item')).not.toBeInTheDocument();
  });

  it('renders layout correctly', () => {
    const { rerender, container } = renderWithProviders(
      <ArrayFieldset>
        <div>Child Content</div>
      </ArrayFieldset>
    );
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toMatchSnapshot();

    rerender(
      <ArrayFieldset label='Test Label'>
        <div>Child Content</div>
      </ArrayFieldset>
    );
    expect(fieldset).toMatchSnapshot();

    rerender(
      <ArrayFieldset label='Test Label' onAdd={() => {}}>
        <div>Child Content</div>
      </ArrayFieldset>
    );
    expect(fieldset).toMatchSnapshot();

    rerender(
      <ArrayFieldset label='Test Label' onAdd={() => {}} onRemove={() => {}}>
        <div>Child Content</div>
      </ArrayFieldset>
    );
    expect(fieldset).toMatchSnapshot();

    rerender(
      <ArrayFieldset
        label='Test Label'
        onAdd={() => {}}
        onRemove={() => {}}
        isRequired
      >
        <div>Child Content</div>
      </ArrayFieldset>
    );
    expect(fieldset).toMatchSnapshot();
  });
});
