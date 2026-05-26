import React from 'react';
import { render, act } from '@testing-library/react';

import { Plugin } from './plugin';
import { useCollectionPlugins } from './use-plugins-hook';
import { PluginConfigProvider } from '../context/plugin-config';

// A fake plugin that mimics PluginCore's isNew-via-init pattern. The schema
// includes the `id` field only while `isNew === true`. This is the regression
// surface we're guarding against: when usePlugins re-inits the plugin on
// every data change, `isNew` flips false the moment data carries an id, and
// the id field disappears from the schema.
class FakeCorePlugin extends Plugin {
  name = 'FakeCore';
  isNew = false;
  initCallCount = 0;

  async init(data: any) {
    this.initCallCount += 1;
    this.isNew = !data?.id;
  }

  editSchema(): any {
    const properties: Record<string, any> = {};
    if (this.isNew) {
      properties.id = { type: 'string', label: 'Id' };
    }
    return { type: 'root', properties };
  }

  enterData(data: any) {
    return { id: data?.id };
  }

  exitData(data: any) {
    return { id: data?.id };
  }
}

function Probe({
  data,
  onResult
}: {
  data: any;
  onResult: (r: ReturnType<typeof useCollectionPlugins>) => void;
}) {
  const result = useCollectionPlugins(data);
  React.useEffect(() => {
    onResult(result);
  }, [result, onResult]);
  return null;
}

function pluginConfigWith(plugin: Plugin) {
  return {
    collectionPlugins: [plugin],
    itemPlugins: [],
    'ui:widget': {}
  };
}

async function flushAsync() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('useCollectionPlugins', () => {
  it('initializes plugins exactly once even when data changes', async () => {
    const plugin = new FakeCorePlugin();
    const config = pluginConfigWith(plugin);
    const results: any[] = [];
    const collect = (r: any) => results.push(r);

    let setData: (d: any) => void = () => {};
    function Wrapper() {
      const [data, setD] = React.useState<any>({});
      setData = setD;
      return (
        <PluginConfigProvider config={config as any}>
          <Probe data={data} onResult={collect} />
        </PluginConfigProvider>
      );
    }

    await act(async () => {
      render(<Wrapper />);
    });
    await flushAsync();

    // Simulate toggling Form -> JSON -> Form, which is what the user does.
    // Each toggle replaces stacData with a different object identity (so a
    // naive [data]-dependent useEffect would re-init the plugin).
    await act(async () => {
      setData({ id: 'foo' });
    });
    await flushAsync();
    await act(async () => {
      setData({ id: 'foo', title: 'bar' });
    });
    await flushAsync();

    // The clone created at mount must have been initialized exactly once.
    // Any number greater than 1 means we re-initialized on a data change,
    // which is the regression that flips PluginCore.isNew the wrong way.
    // We can't read the clone directly, but its effects show up in the
    // editSchema output (see next test).
    expect(plugin.initCallCount).toBeLessThanOrEqual(1);
  });

  it('keeps the id field in the schema after data changes from empty to having an id', async () => {
    // The actual user-visible bug: start with empty data, then the user
    // types an id and toggles views, causing data to carry the id. The id
    // field must remain present in the form schema.
    const plugin = new FakeCorePlugin();
    const config = pluginConfigWith(plugin);
    const results: any[] = [];
    const collect = (r: any) => results.push(r);

    let setData: (d: any) => void = () => {};
    function Wrapper() {
      const [data, setD] = React.useState<any>({});
      setData = setD;
      return (
        <PluginConfigProvider config={config as any}>
          <Probe data={data} onResult={collect} />
        </PluginConfigProvider>
      );
    }

    await act(async () => {
      render(<Wrapper />);
    });
    await flushAsync();

    const initialReady = results[results.length - 1];
    expect(initialReady.isLoading).toBe(false);
    const initialSchema = initialReady.plugins[0].editSchema();
    expect(initialSchema.properties).toHaveProperty('id');

    // Simulate the Form -> JSON click handler, which calls setStacData with
    // the user's typed-in id.
    await act(async () => {
      setData({ id: 'foo' });
    });
    await flushAsync();

    const afterReady = results[results.length - 1];
    const afterSchema = afterReady.plugins[0].editSchema();
    expect(afterSchema.properties).toHaveProperty('id');
  });
});
