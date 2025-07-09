// Eslint configuration object for src
const configSrc = {
  files: [
    "src/*"
  ],
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  rules: {
    "array-callback-return": [
      "error",
      {
        "checkForEach": true
      }
    ],
    "eqeqeq": ["error", "always"],
    "max-depth": ["warn", 4],
    "max-lines": ["warn", 500],
    "max-lines-per-function": ["warn", {"max": 100}],
    "no-console": "warn",
    "no-const-assign": "error",
    "no-else-return": ["error", {allowElseIf: false}],
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "next"
      }
    ],
    "no-var": "error",
    "no-warning-comments": "off",
    "prefer-destructuring": ["error", {
      "array": true,
      "object": true
    }],
    "prefer-const": ["error", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    "radix": "error"
  }
};

// Eslint configuration object for globally ignoring .js files
// - ignore all files that start with a dot
// - ignore all files inside directories named 'dist'
const configIgnores = {
  ignores: [
    "**/.*",
    "**/dist/"
  ]
};

export default [
  configSrc,
  configIgnores
];