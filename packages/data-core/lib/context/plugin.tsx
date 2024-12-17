import React, { createContext, useContext } from 'react';

import { Plugin } from '../plugin-utils/plugin';

// Plugin context provider
const PluginContext = createContext<Plugin | undefined>(undefined);

/**
 * Context provider for each plugin configuration
 * 
 * @param props.config Plugin configuration object
 * @param props.children Child components
 */
export const PluginProvider = (props: {
  plugin: Plugin;
  children: React.ReactNode;
}) => {
  return (
    <PluginContext.Provider value={props.plugin}>
      {props.children}
    </PluginContext.Provider>
  );
};

export const usePlugin = () => {
  const plugin = useContext(PluginContext);

  if (!plugin) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }

  return plugin;
};
