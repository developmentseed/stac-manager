import React, { Suspense, useRef, useState } from 'react';
import { SchemaFieldJson, WidgetProps } from '@stac-manager/data-core';
import { Field, Flex, ProgressCircle } from '@chakra-ui/react';
import { FastField, FastFieldProps } from 'formik';
import {
  CollecticonArrowSemiSpinCcw,
  CollecticonArrowSemiSpinCw,
  CollecticonWrench,
  CollecticonTextBlock
} from '@devseed-ui/collecticons-chakra';
import type JSONEditor from 'jsoneditor';

import { FieldIconBtn, FieldLabel } from '../components/elements';
import { CollecticonIndent } from '../components/icons/indent';

const JsonEditor = React.lazy(() => import('../components/json-jsoneditor'));

// Extend to have access to internal methods provided by the textmode.
interface JSONEditorCodeMode extends JSONEditor {
  compact: () => void;
  format: () => void;
  repair: () => void;
  _onChange: () => void;
}

export function WidgetJSON(props: WidgetProps) {
  const field = props.field as SchemaFieldJson;

  const editorRef = useRef<JSONEditorCodeMode>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Field.Root>
      <Flex gap={4}>
        {field.label && (
          <Field.Label>
            <FieldLabel size='xs'>{field.label}</FieldLabel>
          </Field.Label>
        )}
        {isLoaded && <ControlBar editor={editorRef.current!} />}
      </Flex>

      <Suspense fallback={<Loading />}>
        <FastField name={props.pointer}>
          {({ field: { value }, form: { setFieldValue } }: FastFieldProps) => (
            <JsonEditor
              value={value}
              onChange={(v) => setFieldValue(props.pointer, v)}
              editorRef={editorRef}
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </FastField>
      </Suspense>
    </Field.Root>
  );
}

function Loading() {
  return (
    <Flex alignItems='center' gap={2} justifyContent='center'>
      <ProgressCircle.Root value={null} colorPalette='primary' size='sm'>
        <ProgressCircle.Circle>
          <ProgressCircle.Track />
          <ProgressCircle.Range />
        </ProgressCircle.Circle>
      </ProgressCircle.Root>{' '}
      Loading json editor...
    </Flex>
  );
}

function ControlBar(props: { editor: JSONEditorCodeMode }) {
  const { editor } = props;

  const undoManager = editor.aceEditor.getSession().getUndoManager();

  return (
    <Flex ml='auto' gap={2}>
      <FieldIconBtn
        aria-label='Fix'
        onClick={() => {
          editor.repair?.();
          editor._onChange?.();
        }}
      >
        <CollecticonWrench boxSize={3} />
      </FieldIconBtn>
      <FieldIconBtn
        aria-label='Compact'
        onClick={() => {
          editor.compact?.();
        }}
      >
        <CollecticonTextBlock boxSize={3} />
      </FieldIconBtn>
      <FieldIconBtn
        aria-label='Format'
        onClick={() => {
          editor.format?.();
        }}
      >
        <CollecticonIndent boxSize={3} />
      </FieldIconBtn>
      <FieldIconBtn
        aria-label='Undo'
        disabled={!undoManager?.canUndo()}
        onClick={() => {
          undoManager?.undo();
        }}
      >
        <CollecticonArrowSemiSpinCcw boxSize={3} />
      </FieldIconBtn>
      <FieldIconBtn
        aria-label='Redo'
        disabled={!undoManager?.canRedo()}
        onClick={() => {
          undoManager?.redo();
        }}
      >
        <CollecticonArrowSemiSpinCw boxSize={3} />
      </FieldIconBtn>
    </Flex>
  );
}
