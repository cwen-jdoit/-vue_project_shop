module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        // '@vue/standard'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'space-before-function-paren': 0,
        'eqeqeq': 0,
        'vue/valid-template-root': 0,
        'spaced-comment': 0,
        'quotes': 0,
        'eol-last': 0,
        'key-spacing': 0,
        'vue/valid-v-for': 0,
        'vue/no-unused-vars': 0,
        'vue/no-parsing-error': 0
    }
}