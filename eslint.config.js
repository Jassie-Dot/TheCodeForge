<<<<<<< HEAD
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
=======
>>>>>>> 31ed656d8e789887d02f301e63f0177acbf44e84
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

<<<<<<< HEAD
const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  globalIgnores(['dist', 'Downloads']),
  {
    files: ['src/**/*.{ts,tsx}', 'api/**/*.ts', 'vite.config.ts'],
=======
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
>>>>>>> 31ed656d8e789887d02f301e63f0177acbf44e84
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
<<<<<<< HEAD
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        tsconfigRootDir,
      },
=======
      globals: globals.browser,
>>>>>>> 31ed656d8e789887d02f301e63f0177acbf44e84
    },
  },
])
