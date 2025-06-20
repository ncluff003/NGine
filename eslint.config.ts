import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommendedTypeChecked, {
  ignores: [
    'node_modules',
    './Dist/**',
    './Source/**/*.jest.test.ts',
    './Source/**/*.cy.test.ts',
    'eslint.config.ts',
    'tsup.config.ts',
    'Notes.ts',
    'jest.config.ts',
    './**.config.ts',
    './Test-Applications/**',
    './Test-Applications/webpack.config.ts',
    './Test-Applications/Test-Contact-Form/Dist/**',
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
