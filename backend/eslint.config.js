const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            'scripts/*.js',
            '*.config.js',
            'eslint.config.js',
        ],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'brace-style': ['error', 'allman', { allowSingleLine: true }],
            'indent': [
                'error',
                4,
                {
                    MemberExpression: 1,
                    ignoredNodes: [
                        'FunctionExpression > .params[decorators.length > 0]',
                        'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
                        'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
                    ],
                },
            ],
            'no-tabs': 'error',
            'comma-dangle': ['error', 'always-multiline'],
        },
    },
];
