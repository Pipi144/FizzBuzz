import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppRoutes from "@/RoutePaths";
import Register from "@/app/(auth)/register/page";

//  Mock RegisterForm component to avoid testing its internal logic
jest.mock("@/components/RegisterForm/RegisterForm", () => {
  const MockRegisterForm = () => (
    <div data-testid="register-form">Mocked LoginForm</div>
  );
  MockRegisterForm.displayName = "MockRegisterForm";
  return MockRegisterForm;
});
const renderRegisterPage = () => render(<Register />);
describe("Register Page", () => {
  it("renders the register page correctly", () => {
    renderRegisterPage();

    // Check if the login title is present
    expect(
      screen.getByRole("heading", { name: /Register/i })
    ).toBeInTheDocument();

    // Check if the "Already have an account?" text is visible
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();

    // Check if the login link is present and points to the correct path
    const loginLink = screen.getByRole("link", { name: /Login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", AppRoutes.Login); // Update with your actual path

    // Check if the mocked RegisterForm is rendered
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });
});
