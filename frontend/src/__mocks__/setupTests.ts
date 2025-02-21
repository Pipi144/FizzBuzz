import { server } from "./server";
import "@testing-library/jest-dom";

// Start the MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test (to avoid state pollution)
afterEach(() => server.resetHandlers());

// Close the server when all tests finish
afterAll(() => server.close());
