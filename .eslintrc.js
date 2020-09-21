module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "sourceType": "module" },
  "env": { "node": true },
  "extends": [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
};
