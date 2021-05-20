import { useCallback, useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { getModel } from "./monaco.init";
import { useColorMode } from "../ColorModeProvider";

const LoaderStyles = {
  display: "flex",
  color: "#858585",
  backgroundColor: "#1e1e1e",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center"
};

// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
const MonacoOptions = {};
/** @type IEditorConstructionOptions */
MonacoOptions.embedded = {
  renderLineHighlight: "none",
  quickSuggestions: true,
  showFoldingControls: "always",
  scrollBeyondLastLine: false,
  scrollbar: {
    horizontal: "always",
    horizontalScrollbarSize: 27
  },
  minimap: {
    enabled: false
  },
  "semanticHighlighting.enabled": true
};
/** @type IEditorConstructionOptions */
MonacoOptions.modal = {
  renderLineHighlight: "none",
  quickSuggestions: true,
  showFoldingControls: "always",
  scrollBeyondLastLine: false,
  scrollbar: {
    horizontal: "always",
    horizontalScrollbarSize: 27
  },
  links: false,
  "semanticHighlighting.enabled": true
};

const MonacoEditor = ({
  variant,
  onChange,
  resizeProp,
  delayResize = 300,
  model,
  readOnly,
  onDidChangeCursorPosition,
  ...rest
}: {
  language: string,
  variant?: string,
  onChange?: Function,
  resizeProp?: any,
  delayResize?: number | boolean,
  model?: string,
  readOnly?: boolean,
  onDidChangeCursorPosition?: Function
}) => {
  const editorRef = useRef();
  const [colorMode] = useColorMode();
  const handleChange = useCallback(
    value => {
      const outValue = value.replace(/\r\n/g, "\n");
      if (onChange) onChange(outValue);
      return outValue;
    },
    [onChange]
  );

  const didMount = useCallback(
    (editor /*, monaco*/) => {
      editorRef.current = editor;
      const currentValue = editor.getValue();
      if (model) {
        try {
          editor.setModel(getModel(currentValue, model));
          //console.log("model was set to ", model);
        } catch (e) {
          console.error(e);
        }
      }
      if (onDidChangeCursorPosition) {
        editor.onDidChangeCursorPosition(onDidChangeCursorPosition);
      }
    },
    [model, onDidChangeCursorPosition]
  );

  const options = useMemo(() => {
    if (readOnly) {
      return {
        ...MonacoOptions[variant],
        readOnly: !!readOnly
      };
    }
    return MonacoOptions[variant];
  }, [readOnly, variant]);

  useEffect(() => {
    const handleResize = () => {
      if (!editorRef.current) return;
      editorRef.current.layout({ width: "100%", height: 0 });
      editorRef.current.layout();
    };

    if (delayResize) {
      const timer = setTimeout(handleResize, delayResize);
      return () => clearTimeout(timer);
    }
  }, [resizeProp, delayResize, editorRef]);

  const loader = <div style={LoaderStyles}>Loading...</div>;

  return (
    <Editor
      theme={`vs-${colorMode}-blazestore`}
      tabSize={2}
      options={options}
      onMount={didMount}
      onChange={handleChange}
      loading={loader}
      {...rest}
    />
  );
};

export default MonacoEditor;
