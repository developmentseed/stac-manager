import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

export default function JsonEditor(props: {
  value: any;
  onChange: (value: any) => void;
  editorRef: React.MutableRefObject<JSONEditor | null>;
  onLoad?: () => void;
}) {
  const { value, onChange, onLoad, editorRef } = props;
  const element = useRef<HTMLDivElement>(null);

  // Stash latest callback identities in refs so the mount-only effect below
  // always invokes the freshest closure without re-creating the editor.
  const onChangeRef = useRef(onChange);
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onChangeRef.current = onChange;
    onLoadRef.current = onLoad;
  });

  useEffect(() => {
    if (element.current) {
      const editor = new JSONEditor(
        element.current,
        {
          mode: 'code',
          mainMenuBar: false,
          statusBar: false,
          onChange: () => {
            try {
              onChangeRef.current(editor.get());
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              // no-op
            }
          }
        },
        value || ''
      );

      editor.aceEditor.setOptions({
        tooltipFollowsMouse: false
      });

      editorRef.current = editor;
      onLoadRef.current?.();

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    }
    // The initial `value` is captured intentionally for the editor's initial
    // contents; subsequent updates flow through the effect below. (No
    // react-hooks/exhaustive-deps suppression needed — that plugin isn't
    // configured in this repo's eslint setup.)
  }, []);

  useEffect(() => {
    if (editorRef.current && value) {
      try {
        const currentValue = JSON.stringify(editorRef.current.get());
        const newValue = JSON.stringify(value);
        if (currentValue !== newValue) {
          editorRef.current.set(value);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Invalid incoming JSON value {value, error}', {
          value,
          error
        });
      }
    }
  }, [value]);

  return (
    <Box
      ref={element}
      w='100%'
      h='20rem'
      css={{
        '& .jsoneditor': {
          borderColor: 'base.200',
          borderWidth: '2px',
          borderRadius: 'md'
        },
        '& .ace-jsoneditor .ace_tooltip': {
          minHeight: 'auto'
        },
        '& .ace-jsoneditor .ace_marker-layer .ace_active-line': {
          bg: 'primary.100a'
        }
      }}
    />
  );
}
