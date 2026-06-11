import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import { PluginBox } from './plugin-box';
import { Plugin } from '../plugin-utils/plugin';

const mockPlugin = {
  name: 'TestPlugin',
  editSchema: jest.fn()
};

// Custom renderer to add context or providers if needed
const renderWithProviders = (
  ui: React.ReactNode,
  { renderOptions = {} } = {}
) => {
  // You can wrap the component with any context providers here
  return render(ui, {
    wrapper: ({ children }) => (
      <ChakraProvider value={defaultSystem}>
        <Formik initialValues={{}} onSubmit={() => {}}>
          {children}
        </Formik>
      </ChakraProvider>
    ),
    ...renderOptions
  });
};

describe('PluginBox', () => {
  it('renders ErrorBox when editSchema is null', () => {
    mockPlugin.editSchema.mockReturnValue(null);

    const { getByTestId } = renderWithProviders(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <PluginBox plugin={mockPlugin as any}>
          {({ field }) => <div>{field.label}</div>}
        </PluginBox>
      </Formik>
    );

    expect(getByTestId('plugin-box-error')).toMatchSnapshot();
  });

  it('renders nothing when editSchema is Plugin.HIDDEN', () => {
    mockPlugin.editSchema.mockReturnValue(Plugin.HIDDEN);

    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <PluginBox plugin={mockPlugin as any}>
          {({ field }) => <div>{field.label}</div>}
        </PluginBox>
      </Formik>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders children when editSchema is valid', () => {
    const mockSchema = { type: 'string', label: 'testField' };
    mockPlugin.editSchema.mockReturnValue(mockSchema);

    const { getByText } = renderWithProviders(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <PluginBox plugin={mockPlugin as any}>
          {({ field }) => <div>{field.label}</div>}
        </PluginBox>
      </Formik>
    );

    expect(getByText(/testField/i)).toBeInTheDocument();
  });
});
