import React from 'react';
import { createCollecticon } from '@devseed-ui/collecticons-chakra';

export const CollecticonForm = createCollecticon((props) => (
  <>
    {props.title && <title>{props.title}</title>}
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2 9V11H14V9H2ZM1 7C0.447715 7 0 7.44772 0 8V12C0 12.5523 0.447715 13 1 13H15C15.5523 13 16 12.5523 16 12V8C16 7.44772 15.5523 7 15 7H1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2 2V4H14V2H2ZM1 0C0.447715 0 0 0.447715 0 1V5C0 5.55228 0.447715 6 1 6H15C15.5523 6 16 5.55228 16 5V1C16 0.447715 15.5523 0 15 0H1Z'
      fill='currentColor'
    />
    <rect y='14' width='8' height='2' fill='currentColor' />
  </>
));
