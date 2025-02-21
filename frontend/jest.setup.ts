import { mockAuthStore } from "@/__mocks__/authStore";
import { server } from "@/__mocks__/server";
import "@testing-library/jest-dom";
beforeEach(() => {
  mockAuthStore();
});

// Start the MSW server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test (to avoid state pollution)
afterEach(() => server.resetHandlers());

// Close the server when all tests finish
afterAll(() => server.close());
