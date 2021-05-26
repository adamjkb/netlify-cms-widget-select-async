module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: {
            'jsx': true
        }
    },
    env: {
        browser: true,
        es2017: true,
        node: true
    },
    rules: {
        indent: ['error', 4],
        'no-unused-vars': ['warn', { 'args': 'none' }],
        quotes: ['error', 'single'],
        semi: ['warn', 'never']
    },
    globals: {
        CMS: 'readonly',
    }
}
