export default monaco => {
  // Register a new language
  monaco.languages.register({ id: "firebaseRuleset" });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider("firebaseRuleset", {
    // Set defaultToken to invalid to see what you do not tokenize yet
    //defaultToken: "invalid",

    keywords: ["service", "match", "allow", "if", "true", "false", "null", "function", "return"],
    methods: ["read", "write", "get", "list", "create", "update", "delete"],

    operators: [
      "<=",
      ">=",
      "==",
      "!=",
      "===",
      "!==",
      "=>",
      "+",
      "-",
      "**",
      "*",
      "/",
      "%",
      "++",
      "--",
      "<<",
      "</",
      ">>",
      ">>>",
      "&",
      "|",
      "^",
      "!",
      "~",
      "&&",
      "||",
      "?",
      ":",
      "=",
      "+=",
      "-=",
      "*=",
      "**=",
      "/=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
      "&=",
      "|=",
      "^=",
      "@"
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,

    // The main tokenizer for our languages
    tokenizer: {
      root: [[/[{}]/, "delimiter.bracket"], { include: "common" }],

      common: [
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              "@methods": "type.identifier",
              "@keywords": "keyword",
              "@default": "identifier"
            }
          }
        ],

        // whitespace
        { include: "@whitespace" },

        // delimiters and operators
        [/[()[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "delimiter",
              "@default": ""
            }
          }
        ],

        // numbers
        [/(@digits)[eE]([-+]?(@digits))?/, "number.float"],
        [/(@digits)\.(@digits)([eE][-+]?(@digits))?/, "number.float"],
        [/(@digits)/, "number"],

        // delimiter: after number because of .\d floats
        [/[;,.]/, "delimiter"],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/'([^'\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/"/, "string", "@string_double"],
        [/'/, "string", "@string_single"],
        [/`/, "string", "@string_backtick"]
      ],

      whitespace: [
        [/[ \t\r\n]+/, ""],
        [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"]
      ],

      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"]
      ],

      jsdoc: [
        [/[^/*]+/, "comment.doc"],
        [/\*\//, "comment.doc", "@pop"],
        [/[/*]/, "comment.doc"]
      ],

      string_double: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"]
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/'/, "string", "@pop"]
      ],

      string_backtick: [
        [/\${/, { token: "delimiter.bracket", next: "@bracketCounting" }],
        [/[^\\`$]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/`/, "string", "@pop"]
      ],

      bracketCounting: [
        [/{/, "delimiter.bracket", "@bracketCounting"],
        [/}/, "delimiter.bracket", "@pop"],
        { include: "common" }
      ]
    }
  });
};
