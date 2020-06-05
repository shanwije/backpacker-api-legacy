module.exports = {
    env: {
        node: 1,
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        // allow console and debugger in development
        'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'prettier/prettier': ['error'],
        'no-unused-vars': 'off',
        'func-names': 'off',
    },
};
