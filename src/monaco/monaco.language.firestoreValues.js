/**
 * Example
{
  "a": "$id",
  "b": "$ref:",
  "c": "$time:",
  "d": "$serverTime()",
  "e": "$inc:",
  "f": "$geo",
  "g": "$union",
  "h": "$remove",
  "i": "$delete"
}
 */

export default monaco => {
  const highlights = [
    ["id", "#ff9b65"],
    ["ref:", "#b0ffff"],
    ["time:", "#b0ffb0"],
    ["serverTime()", "#b0ffb0"],
    ["inc:", "#ffffb0"],
    ["geo", "#5597d2"],
    ["union", "#ffb0ff"],
    ["remove", "#ffb0ff"],
    ["delete", "#d46363"]
  ];
  const highlighter = highlights.reduce((a, c, i) => {
    a["$" + c[0]] = i;
    return a;
  }, {});
  const tokenPattern = new RegExp(
    `(?<=")\\$(${highlights.map(h => h[0].replace(/[()]/g, "\\$&")).join("|")})`,
    "g"
  );

  const tokenNamer = hl => "value" + hl[0].toLowerCase().replace(/[:()]/g, "");

  monaco.editor.defineTheme("vs-dark-blazestore", {
    base: "vs-dark",
    inherit: true,
    rules: highlights.map(hl => ({
      token: tokenNamer(hl),
      foreground: hl[1].substr(1)
    }))
  });

  // add variable highlighting inside the JSON language
  // i.e ${variable}
  const legend = {
    tokenTypes: highlights.map(tokenNamer),
    tokenModifiers: ["declaration"]
  };

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
            type = highlighter[match[0]],
            modifier = 0; // declaration

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
    label: v[0],
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: "$" + v[0]
  });
  const firestoreValuesCompletionItemProvider = {
    provideCompletionItems: (/*model, position, context, token*/) => {
      return {
        suggestions: highlights.map(suggestionMapper)
      };
    }
  };
  monaco.languages.registerCompletionItemProvider("json", firestoreValuesCompletionItemProvider);
};
