// https://github.com/facebook/create-react-app/issues/7529
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/eslint-recommended",
    "react-app",
    // "plugin:react-perf/recommended"
  ],
  parserOptions: {
    include: ["src/**/*.tsx", "src/**/*.ts"],
    exclude: ["public/*", "src/**/*.d.tsx"]
  },
  settings: {
    "import/extensions": [".js", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".js", ".ts", ".tsx"]
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".tsx"]
      },
      alias: {
        map: [
          ['@common', './src/common']
        ],
        extensions: [".js", ".ts", ".tsx"]
      }
    }
  },
  rules: {
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".tsx"]
      }
    ],
    "react/prop-types": [0],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/consistent-type-assertions": 0,
    "@typescript-eslint/no-angle-bracket-type-assertion": 0,
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",
    "@typescript-eslint/indent": ["error", 2],
    "no-param-reassign": 0,
    "react/jsx-props-no-spreading": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "max-classes-per-file": 0,
    "eqeqeq": ["error", "always", {"null": "ignore"}],
    "@typescript-eslint/indent": 0,
    "import/no-extraneous-dependencies": 0,
    "react-perf/jsx-no-new-object-as-prop": 0,
    "no-multiple-empty-lines": 0,
    "react/jsx-indent": 0,
    "max-len": "warn",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ]
  }
};