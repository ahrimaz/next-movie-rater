module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: for global setup
  moduleNameMapper: {
    // Handle CSS imports (e.g., if you use CSS Modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias for @/ components
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Add this line to handle prisma client properly
  // It tells Jest to use the browser version of the Prisma client
  // if your schema has `generator client { provider = "prisma-client-js" ... }` (default)
  // For `provider = "prisma-client-js" previewFeatures = ["referentialActions"]` or similar,
  // you might need to adjust or ensure your test setup doesn't actually hit the DB unprepared.
  // For unit tests where Prisma is mocked, this might be less critical.
  // preset: "@shelf/jest-mongodb", // Example if using mongodb specific presets
  // modulePathIgnorePatterns: ['<rootDir>/node_modules/@prisma/client/runtime/'], // This can sometimes help with Prisma issues
};
