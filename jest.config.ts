import {
  createDefaultEsmPreset,
  pathsToModuleNameMapper,
  type JestConfigWithTsJest,
} from 'ts-jest';

import { compilerOptions } from './tsconfig.aliases.json';
import packageJson from './package.json';

const pathAliases = {
  ...compilerOptions.paths,
  // Jest wants to know the folder to do the transformation, not the `src/index.js`. 🤷
  [packageJson.name]: ['src'],
};

// See here for more info https://kulshekhar.github.io/ts-jest/docs/getting-started/presets/#advanced
const preset = createDefaultEsmPreset({
  tsconfig: './tests/tsconfig.json',
});

const config: JestConfigWithTsJest = {
  ...preset,
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(pathAliases, {
    useESM: true,
  }),
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/build/'],
  testRegex: ['/tests/.*tests?.[mc]?[jt]sx?$', '.*.(spec|test).[mc]?[jt]sx?$'],
  // I dono't think we need to run the spec multiple times.. the functional test on tests/ maybe.
  // We can change this back if we consider it useful to run the spec tests when the code is transpiled to javascript
  testPathIgnorePatterns: [
    'node_modules',
    '<rootDir>/build[^/]*/',
    '<rootDir>/dist/',
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!src/**/*.{spec,test}.{js,ts,jsx,tsx}',
  ],
  verbose: true,
  // Important to use the AfterEnv to have the jest timeout and all the other settings inside that file to be correctly understood
  // See the difference between setupFiles and setupFilesAfterEnv to see the difference.
  setupFilesAfterEnv: ['./jest.setup.ts'],
};

module.exports = config;
