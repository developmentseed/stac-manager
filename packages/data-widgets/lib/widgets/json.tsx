import React, { Suspense, useRef, useState } from 'react';
import { SchemaFieldJson, WidgetProps } from '@stac-manager/data-core';
import {
  CircularProgress,
  Flex,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
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
    <FormControl>
      <Flex gap={4}>
        {field.label && (
          <FormLabel>
            <FieldLabel size='xs'>{field.label}</FieldLabel>
          </FormLabel>
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
    </FormControl>
  );
}

function Loading() {
  return (
    <Flex alignItems='center' gap={2} justifyContent='center'>
      <CircularProgress isIndeterminate color='primary.500' size='1.5rem' />{' '}
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
        icon={<CollecticonWrench size={3} />}
      />
      <FieldIconBtn
        aria-label='Compact'
        onClick={() => {
          editor.compact?.();
        }}
        icon={<CollecticonTextBlock size={3} />}
      />
      <FieldIconBtn
        aria-label='Format'
        onClick={() => {
          editor.format?.();
        }}
        icon={<CollecticonIndent size={3} />}
      />
      <FieldIconBtn
        aria-label='Undo'
        isDisabled={!undoManager?.canUndo()}
        onClick={() => {
          undoManager?.undo();
        }}
        icon={<CollecticonArrowSemiSpinCcw size={3} />}
      />
      <FieldIconBtn
        aria-label='Redo'
        isDisabled={!undoManager?.canRedo()}
        onClick={() => {
          undoManager?.redo();
        }}
        icon={<CollecticonArrowSemiSpinCw size={3} />}
      />
    </Flex>
  );
}
