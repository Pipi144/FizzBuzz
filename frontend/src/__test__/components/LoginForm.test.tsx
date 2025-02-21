import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm/LoginForm";
import AppRoutes from "@/RoutePaths";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { TAuthStore } from "@/stores/authStore";
import { mockAuthStore } from "@/__mocks__/authStore";
import { mockAuthServerError } from "@/__mocks__/authHandlers";

// Mock Next.js Router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// mock spinner due to external import
jest.mock("@/components/ui/spinner", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="login-spinner">Spinner</div>,
  };
});

// Mock Router
const mockRouter = { replace: jest.fn() };

// Provide QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = createReactQueryWrapper(queryClient);

// mock auth store
const mockSetCurrentUser = jest.fn();
const defaultState: TAuthStore = {
  currentUser: null,
  setCurrentUser: mockSetCurrentUser,
  removeUser: jest.fn(),
};

// render login form
const renderLoginForm = () => render(<LoginForm />, { wrapper });

// Helper function to get form elements (avoids calling `screen.getBy*` before rendering)
const getLoginFormElements = () => ({
  userNameInput: screen.getByLabelText("Username"),
  passwordInput: screen.getByLabelText("Password"),
  loginBtn: screen.getByRole("button", { name: /login/i }),
});

// Helper function to fill the form
const fillLoginForm = (username: string, password: string) => {
  const { userNameInput, passwordInput } = getLoginFormElements();
  fireEvent.change(userNameInput, { target: { value: username } });
  fireEvent.change(passwordInput, { target: { value: password } });
};

// Helper function to submit the form
const submitLoginForm = () => {
  const { loginBtn } = getLoginFormElements();
  fireEvent.click(loginBtn);
};

// ** Test **
describe("LoginForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockAuthStore(defaultState);
  });

  it("renders login form correctly", () => {
    renderLoginForm();
    const { userNameInput, passwordInput, loginBtn } = getLoginFormElements();

    expect(userNameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginBtn).toBeInTheDocument();
  });
  it("input fields update value properly on change", () => {
    renderLoginForm();
    const { userNameInput, passwordInput } = getLoginFormElements();

    fillLoginForm("validUser", "validPass");

    expect(userNameInput).toHaveProperty("value", "validUser");
    expect(passwordInput).toHaveProperty("value", "validPass");
  });
  it("validates empty fields and shows error messages", async () => {
    renderLoginForm();
    submitLoginForm();

    await waitFor(() => {
      expect(
        screen.getByText("Username required and at least 5 characters")
      ).toBeInTheDocument();
      expect(screen.getByText("Password required")).toBeInTheDocument();
    });
  });

  it("handles successful login", async () => {
    renderLoginForm();
    fillLoginForm("validUser", "validPass");
    submitLoginForm();

    await waitFor(() => {
      expect(mockSetCurrentUser).toHaveBeenCalledWith({
        userId: "123",
        username: "validUser",
      });
      expect(mockRouter.replace).toHaveBeenCalledWith(AppRoutes.Home);
    });
  });

  it("handles login failure and shows error message", async () => {
    renderLoginForm();
    fillLoginForm("invalidUser", "wrongPass");
    submitLoginForm();

    await waitFor(() => {
      expect(screen.getByText(mockAuthServerError.message)).toBeInTheDocument();
    });
  });
});
