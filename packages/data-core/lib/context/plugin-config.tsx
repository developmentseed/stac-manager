import React, { createContext, useContext } from 'react';

import { PluginConfig } from '../config';

interface PluginConfigContextProps {
  config: PluginConfig;
}

// Create context
const PluginConfigContext = createContext<PluginConfigContextProps | null>(
  null
);

/**
 * Global context provider for the configuration
 * 
 * @param props.config Configuration object
 * @param props.children Child components
 */
export function PluginConfigProvider(props: {
  config: PluginConfig;
  children: React.ReactNode;
}) {
  const { config, children } = props;
  return (
    <PluginConfigContext.Provider value={{ config }}>
      {children}
    </PluginConfigContext.Provider>
  );
}

export const usePluginConfig = () => {
  const context = useContext(PluginConfigContext);

  if (!context) {
    throw new Error(
      'usePluginConfig must be used within a PluginConfigContextProvider'
    );
  }

  return context.config;
};
