module.exports = {
  env: {
    mocha: true
  },
  extends: [
      // add more generic rulesets here, such as:
      // 'eslint:recommended',
      'plugin:vue/essential'
    ],  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off'
  }
}
