//@ts-check
/** @type {import('prettier').Options} */
const options = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  tabWidth: 2,
  proseWrap: 'always',
  quoteProps: 'as-needed',
  plugins: ['prettier-plugin-jsdoc'],
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 4,
      },
    },
    {
      files: ['tsconfig.*json', 'jsconfig.*json', '.vscode/*.json'],
      excludeFiles: ['tsconfig.aliases.json'],
      options: {
        parser: 'jsonc',
      },
    },
  ],
};

module.exports = options;
