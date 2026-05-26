import { PluginCore } from './core';

describe('PluginCore.init', () => {
  it('marks the plugin as new when first initialized without an id', async () => {
    const plugin = new PluginCore();
    await plugin.init({});
    expect(plugin.isNew).toBe(true);
  });

  it('marks the plugin as not new when first initialized with an id', async () => {
    const plugin = new PluginCore();
    await plugin.init({ id: 'existing' });
    expect(plugin.isNew).toBe(false);
  });

  it('does not flip isNew back to false when re-initialized with data that has an id', async () => {
    // This simulates: user opens /collections/new (data={}), types an id in
    // the form, toggles to JSON view which triggers a re-init with data that
    // now contains the typed id. The id field should remain visible after
    // toggling back to the form, which requires isNew to stay true.
    const plugin = new PluginCore();
    await plugin.init({});
    expect(plugin.isNew).toBe(true);

    await plugin.init({ id: 'user-typed-id' });
    expect(plugin.isNew).toBe(true);
  });

  it('does not flip isNew to true when re-initialized with empty data after editing', async () => {
    // The mirror case: an existing collection should stay not-new even if a
    // later init somehow receives empty data.
    const plugin = new PluginCore();
    await plugin.init({ id: 'existing' });
    expect(plugin.isNew).toBe(false);

    await plugin.init({});
    expect(plugin.isNew).toBe(false);
  });
});
