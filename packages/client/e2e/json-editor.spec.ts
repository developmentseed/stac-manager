import { test, expect } from '@playwright/test';

// Functional test for the jsoneditor/Ace integration. The unit tests in
// data-widgets use mocks that bypass Ace entirely, so they pass even when the
// real text-layer never paints. This test loads the harness page in a real
// browser and asserts that the JSON content actually reaches Ace's
// .ace_text-layer.
test('WidgetJSON renders the JSON content in Ace text-layer', async ({
  page
}) => {
  await page.goto('/test-jsoneditor');

  // The editor mounts attached; an *empty* text-layer or a zero-width
  // container both indicate the bug we're guarding against.
  const editor = page.locator('.ace_editor.ace-jsoneditor');
  await expect(editor).toBeAttached();

  const textLayer = editor.locator('.ace_text-layer');
  await expect(textLayer).toContainText('"id": "test-collection"', {
    timeout: 5_000
  });
  await expect(textLayer).toContainText('"type": "Collection"');
});
