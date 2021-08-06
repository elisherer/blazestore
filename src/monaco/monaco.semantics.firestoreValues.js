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
    ["id", 0],
    ["ref:", 1],
    ["time:", 2],
    ["serverTime()", 2],
    ["createTime", 2],
    ["updateTime", 2],
    ["inc:", 3],
    ["geo", 4],
    ["union", 5],
    ["remove", 5],
    ["delete", 6]
  ];
  const highlighter = highlights.reduce((a, c) => {
    a["$" + c[0]] = c[1];
    return a;
  }, {});
  const tokenPattern = new RegExp(
    `(?<=")\\$(${highlights.map(h => h[0].replace(/[()]/g, "\\$&")).join("|")})`,
    "g"
  );

  // add variable highlighting inside the JSON language
  // i.e ${variable}
  const legend = {
    tokenTypes: ["blaze0", "blaze1", "blaze2", "blaze3", "blaze4", "blaze5", "blaze6"],
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
