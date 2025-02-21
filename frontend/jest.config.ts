import nextJest from "next/jest";
import type { Config } from "jest";
const createJestConfig = nextJest({
  dir: "./", // ✅ Correctly points to Next.js root
});

const customJestConfig: Config = {
  coverageProvider: "v8", // ✅ Uses V8 for coverage
  preset: "ts-jest", // ✅ Ensures Jest understands TypeScript
  testEnvironment: "jest-fixed-jsdom", // ✅ Supports DOM testing
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "ts-jest",
      { tsconfig: "tsconfig.jest.json", useESM: true },
    ], // ✅ Ensures TypeScript transformation
    "^.+\\.(js|jsx)$": "babel-jest", // ✅ Uses Babel for JavaScript files
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // ✅ Supports absolute imports
  },

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "<rootDir>/src/__mocks__/setupTests.ts",
  ], // ✅ Ensures test setup runs

  transformIgnorePatterns: [
    "/node_modules/(?!@testing-library|@tanstack/react-query|lucide-react)", // ✅ Allows Jest to transform necessary dependencies
  ],

  collectCoverage: true,
  coverageDirectory: "coverage",

  resetMocks: true, // ✅ Resets mocks automatically
  clearMocks: true, // ✅ Clears mocks between tests

  verbose: true, // ✅ Shows detailed test output,
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage",
    "<rootDir>/dist",
  ],
  extensionsToTreatAsEsm: [".ts"],
};

export default createJestConfig(customJestConfig);
