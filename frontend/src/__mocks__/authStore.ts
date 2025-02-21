import { TAuthStore, useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

const useStoreMock = jest.mocked(useAuthStore);

export const mockAuthStore = (overrides: Partial<TAuthStore> = {}) => {
  useStoreMock.mockImplementation((getterFn) => {
    return getterFn({
      ...jest.requireActual("@/stores/authStore").useAuthStore(),
      ...overrides,
    });
  });
};
