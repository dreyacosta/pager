module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
    'no-use-before-define': 0,
    'max-classes-per-file': 0,
    'object-curly-newline': 0,
    'class-methods-use-this': 0,
  },
};
