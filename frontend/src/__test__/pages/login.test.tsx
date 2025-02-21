import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Login from "@/app/(auth)/login/page";
import AppRoutes from "@/RoutePaths";

//  Mock LoginForm component to avoid testing its internal logic
jest.mock("@/components/LoginForm/LoginForm", () => {
  const MockLoginForm = () => (
    <div data-testid="login-form">Mocked LoginForm</div>
  );
  MockLoginForm.displayName = "MockLoginForm";
  return MockLoginForm;
});
const renderLoginPage = () => render(<Login />);
describe("Login Page", () => {
  it("renders the login page correctly", () => {
    renderLoginPage();

    // Check if the login title is present
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();

    // Check if the "Don't have an account?" text is visible
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();

    // Check if the register link is present and points to the correct path
    const registerLink = screen.getByRole("link", { name: /Register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", AppRoutes.Register); // Update with your actual path

    // Check if the mocked LoginForm is rendered
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
