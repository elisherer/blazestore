import { useCallback, useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import registerFirestoreValues from "./monaco.language.firestoreValues";

let _monaco;

const getModel = (value, uri) => {
  if (!_monaco) {
    console.warn("Called getModel before it is available!");
    return;
  }
  const existingModel = _monaco.editor.getModels().find(m => m.uri.toString() === uri);
  if (existingModel) {
    existingModel.applyEdits([
      {
        range: existingModel.getFullModelRange(),
        text: value
      }
    ]);
  }

  return existingModel || _monaco.editor.createModel(value, "json", _monaco.Uri.parse(uri));
};

const initMonaco = monaco => {
  if (window._monacoInitialized) return;
  window._monacoInitialized = true;

  _monaco = monaco;
  registerFirestoreValues(monaco);
};

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
  const handleChange = useCallback(
    value => {
      const outValue = value.replace(/\r\n/g, "\n");
      if (onChange) onChange(outValue);
      return outValue;
    },
    [onChange]
  );

  const didMount = useCallback(
    (editor, monaco) => {
      initMonaco(monaco);
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
      theme="vs-dark-blazestore"
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
