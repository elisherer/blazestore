import { loader } from "@monaco-editor/react";
import registerFirestoreValues from "./monaco.semantics.firestoreValues";
import registerFirebaseRuleset from "./monaco.language.firebaseRuleset";

loader.config({
  paths: {
    vs: "/vs"
  }
});

const globalInitializationKey = "__INIT_MONACO__";

let _monaco;

export const getModel = (value, uri) => {
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

loader.init().then(monaco => {
  if (typeof monaco === "undefined") {
    console.warn("Called initMonaco before it is available! (no initialization will happen)");
    return;
  }
  _monaco = monaco; // save inside module

  // skip if already initialized
  if (window[globalInitializationKey]) return;
  // prevent entering this method again (when developing on this method you need to refresh)
  // also, we keep it on 'window' to prevent it from happening when HMR hits
  window[globalInitializationKey] = true;

  const blazeColors = [
    ["#ff9b63", "#a54024"],
    ["#b0ffff", "#3dacac"],
    ["#b0ffb0", "#21903a"],
    ["#ffffb0", "#b4b446"],
    ["#559bd4", "#0e4da5"],
    ["#ffb0ff", "#a84ca8"],
    ["#d46363", "#a01c1c"]
  ];

  monaco.editor.defineTheme("vs-dark-blazestore", {
    base: "vs-dark",
    inherit: true,
    rules: blazeColors.map((color, i) => ({
      token: `blaze${i}`,
      foreground: color[0].substr(1)
    }))
  });

  monaco.editor.defineTheme("vs-light-blazestore", {
    base: "vs",
    inherit: true,
    rules: blazeColors.map((color, i) => ({
      token: `blaze${i}`,
      foreground: color[1].substr(1)
    }))
  });

  registerFirestoreValues(monaco);
  registerFirebaseRuleset(monaco);
});
