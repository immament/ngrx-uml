module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-expect-message'],
  globals: {
    'ts-jest': { tsConfig: './test/tsconfig.json' }
  },
  verbose: true,
 // silent: true
};