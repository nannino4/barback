import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    rules: {
      'brace-style': ['error', 'allman', { allowSingleLine: true }],
      'indent': ['error', 4, 
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
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
