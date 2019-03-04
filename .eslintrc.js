module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    // 'no-console': ['error', { allow: ['info', 'warn', 'error', 'log'] }], // TODO - REMOVE
    'linebreak-style': 0,
    'object-curly-newline': ['error', {
      'ExportDeclaration': { 'multiline': true, 'minProperties': 4 }
    }]
    //'no-unused-vars': 0 // TODO - REMOVE
  },
  plugins: ['import'],
};
