export default monaco => {
  monaco.editor.defineTheme("vs-dark-blazestore", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "valueref", foreground: "b0ffff" },
      { token: "valuetime", foreground: "b0ffb0" },
      { token: "valueinc", foreground: "ffffb0" },
      { token: "valuearray", foreground: "ffb0ff" }
    ]
  });

  // add variable highlighting inside the JSON language
  // i.e ${variable}
  const legend = {
    tokenTypes: ["valueref", "valuetime", "valueinc", "valuearray"],
    tokenModifiers: ["declaration"]
  };
  const tokenPattern = /(?<=")\$(ref:|time:|serverTime\(\)|inc:|geo|union|remove|delete)/g;
  monaco.languages.registerDocumentSemanticTokensProvider("json", {
    getLegend: () => legend,
    provideDocumentSemanticTokens: function (model /*, lastResultId, token*/) {
      const lines = model.getLinesContent();

      /** @type {number[]} */
      const data = [];

      let prevLine = 0;
      let prevChar = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let match = null; (match = tokenPattern.exec(line)); ) {
          let start = i - prevLine, // translate line to deltaLine
            end = prevLine === i ? match.index - prevChar : match.index, // for the same line, translate start to deltaStart
            type = 0, // ref
            modifier = 0; // declaration

          if (match[0].startsWith("$ref")) {
            type = 0;
          }
          if (match[0].startsWith("$time:") || match[0].startsWith("$serverTime()")) {
            type = 1;
          }
          if (match[0].startsWith("$inc:")) {
            type = 2;
          }
          if (match[0].startsWith("$union") || match[0].startsWith("$remove")) {
            type = 3;
          }
          data.push(start, end, match[0].length, type, modifier);

          prevLine = i;
          prevChar = match.index;
        }
      }
      return {
        data: new Uint32Array(data),
        resultId: null
      };
    },
    releaseDocumentSemanticTokens: (/*resultId*/) => {}
  });

  // add suggestions
  const suggestionMapper = v => ({
    label: v,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: "$" + v
  });
  const firestoreValuesCompletionItemProvider = {
    provideCompletionItems: (/*model, position, context, token*/) => {
      return {
        suggestions: [
          "ref:",
          "time:",
          "inc:",
          "serverTime()",
          "geo",
          "union",
          "remove",
          "delete"
        ].map(suggestionMapper)
      };
    }
  };
  monaco.languages.registerCompletionItemProvider("json", firestoreValuesCompletionItemProvider);
};
