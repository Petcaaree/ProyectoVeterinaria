import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'logs/**',
      'dist/**',
      // Scripts ejecutados dentro de mongosh (tienen `db` como global)
      'migracion_nombreClinica.js',
      // Entidades de filtro latentes: referencian clases/enums aún no importados
      'vet/models/entidades/FiltroVeterinaria.js',
      'vet/models/entidades/FiltroPaseador.js',
      'vet/models/entidades/FiltroCuidador.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
    },
  },
  {
    files: ['test/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
