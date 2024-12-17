import React from 'react';
import { createCollecticon } from '@devseed-ui/collecticons-chakra';

export const CollecticonIndent = createCollecticon(
  (props) => (
    <>
      {props.title && <title>{props.title}</title>}
      <path d='M 0,32 v 64 h 416 v -64 z M 160,160 v 64 h 352 v -64 z M 160,288 v 64 h 288 v -64 z M 0,416 v 64 h 320 v -64 z' />
    </>
  ),
  {
    viewBox: '0 0 512 512'
  }
);
