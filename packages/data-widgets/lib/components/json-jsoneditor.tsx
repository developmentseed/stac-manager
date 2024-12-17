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
              onChange(editor.get());
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
      onLoad?.();

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    }
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
      h='20rem'
      sx={{
        '.jsoneditor': {
          borderColor: 'base.200',
          borderWidth: '2px',
          borderRadius: 'md'
        },
        '.ace-jsoneditor': {
          '.ace_tooltip': {
            minHeight: 'auto'
          },
          '.ace_marker-layer .ace_active-line': {
            bg: 'primary.100a'
          }
        }
      }}
    />
  );
}
