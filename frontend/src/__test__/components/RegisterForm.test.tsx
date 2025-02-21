import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AppRoutes from "@/RoutePaths";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import RegisterForm from "@/components/RegisterForm/RegisterForm";
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
const mockRouter = { push: jest.fn() };

// Provide QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = createReactQueryWrapper(queryClient);

// render login form
const renderLoginForm = () => render(<RegisterForm />, { wrapper });

// Helper function to get form elements (avoids calling `screen.getBy*` before rendering)
const getLoginFormElements = () => ({
  userNameInput: screen.getByLabelText("Username"),
  passwordInput: screen.getByLabelText("Password"),
  registerBtn: screen.getByTestId("submit-btn"),
});

// Helper function to fill the form
const fillLoginForm = (username: string, password: string) => {
  const { userNameInput, passwordInput } = getLoginFormElements();
  fireEvent.change(userNameInput, { target: { value: username } });
  fireEvent.change(passwordInput, { target: { value: password } });
};

// Helper function to submit the form
const submitLoginForm = () => {
  const { registerBtn } = getLoginFormElements();
  fireEvent.click(registerBtn);
};

// ** Test **
describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders register form correctly", () => {
    renderLoginForm();
    const { userNameInput, passwordInput, registerBtn } =
      getLoginFormElements();

    expect(userNameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(registerBtn).toBeInTheDocument();
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

  it("handles successful register", async () => {
    renderLoginForm();
    fillLoginForm("validUser", "validPass");
    submitLoginForm();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(AppRoutes.Login);
    });
  });

  it("handles register failure and shows error message", async () => {
    renderLoginForm();
    fillLoginForm("invalidUser", "wrongPass");
    submitLoginForm();

    await waitFor(() => {
      expect(screen.getByText(mockAuthServerError.message)).toBeInTheDocument();
    });
  });
});
