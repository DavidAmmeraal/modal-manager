export default {
  testEnvironment: 'jest-environment-jsdom',
  projects: ['<rootDir>/packages/*/jest.config.mjs'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}
