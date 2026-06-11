import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Formik } from 'formik';
import { WidgetJSON } from '@stac-manager/data-widgets';

// Dev-only harness for functional/Playwright tests of WidgetJSON. Mounts the
// widget inside a Formik form with a fixed value, with no auth, no
// StacApiProvider, and no async data fetches — so the test can isolate the
// jsoneditor/Ace rendering layer from everything else.
const FIXED_VALUE = {
  type: 'Collection',
  id: 'test-collection',
  title: 'Test Collection',
  description: 'A fixture for the JSON editor functional test.',
  extent: {
    spatial: { bbox: [[-180, -90, 180, 90]] },
    temporal: { interval: [['2020-01-01T00:00:00Z', null]] }
  },
  license: 'proprietary'
};

export default function TestJsonEditor() {
  return (
    <Box>
      <Heading size='md' mb={4}>
        JSON Editor harness
      </Heading>
      <Formik
        enableReinitialize
        initialValues={{ jsonData: FIXED_VALUE }}
        onSubmit={() => {}}
      >
        {() => (
          <Box data-testid='json-editor-harness'>
            <WidgetJSON
              field={{ type: 'json', label: 'Json Document' }}
              pointer='jsonData'
            />
          </Box>
        )}
      </Formik>
    </Box>
  );
}
