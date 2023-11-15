export default {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  setupFilesAfterEnv: ['<rootDir>/setupTests.mjs'],
  testMatch: ['<rootDir>src/**/?(*.)+(spec|test).[jt]s?(x)'],
}
