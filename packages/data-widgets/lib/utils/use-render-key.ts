import { useState } from 'react';
import { useDeepCompareEffect } from 'react-use';

/**
 * Creates a new key on deep props change.
 * The key won't change between the first render and after mount.
 *
 * @param props Props to deep check.
 * @returns component key
 */
export const useRenderKey = (props: any[]) => {
  const [renderKey, setSenderKey] = useState(-1);
  useDeepCompareEffect(() => {
    setSenderKey((v) => v + 1);
  }, props);

  return `key-${Math.max(0, renderKey)}`;
};
