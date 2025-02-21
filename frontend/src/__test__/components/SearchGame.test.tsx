import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchGame from "@/components/SearchGame/SearchGame";
import { useGameContext } from "@/Providers/GameProvider";

// ✅ Mock useGameContext
jest.mock("@/Providers/GameProvider", () => ({
  useGameContext: jest.fn(),
}));

// ** Test **
describe("SearchGame Component", () => {
  const mockSetSearchGameValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // ✅ Always return a mock implementation for useGameContext
    (useGameContext as jest.Mock).mockReturnValue({
      searchGameValue: "",
      setSearchGameValue: mockSetSearchGameValue,
    });
  });

  it("renders correctly", () => {
    render(<SearchGame />);
    expect(screen.getByPlaceholderText("Search game...")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<SearchGame />);
    const searchInput = screen.getByPlaceholderText("Search game...");

    fireEvent.change(searchInput, { target: { value: "Test Game" } });

    expect(searchInput).toHaveValue("Test Game");
  });

  it("calls setSearchGameValue after delay", async () => {
    render(<SearchGame />);
    const searchInput = screen.getByPlaceholderText("Search game...");

    fireEvent.change(searchInput, { target: { value: "Debounce Test" } });

    await waitFor(
      () => {
        expect(mockSetSearchGameValue).toHaveBeenCalledWith("Debounce Test");
      },
      { timeout: 500 }
    );
  });

  it("clears input when close button is clicked", async () => {
    render(<SearchGame />);
    const searchInput = screen.getByPlaceholderText("Search game...");

    fireEvent.change(searchInput, { target: { value: "Clear Test" } });

    expect(searchInput).toHaveValue("Clear Test");

    // Ensure clear button appears
    const clearBtn = await screen.findByTestId("clear-search-btn");
    expect(clearBtn).toBeInTheDocument();

    // Click clear button
    fireEvent.click(clearBtn);

    // Expect input to be cleared
    expect(searchInput).toHaveValue("");

    await waitFor(() => {
      expect(mockSetSearchGameValue).toHaveBeenCalledWith("");
    });
  });

  it("does not call setSearchGameValue immediately (debounce check)", async () => {
    render(<SearchGame />);
    const searchInput = screen.getByPlaceholderText("Search game...");

    fireEvent.change(searchInput, { target: { value: "Fast Typing" } });
    fireEvent.change(searchInput, { target: { value: "Fast Typing Again" } });

    // Ensure the function is NOT called immediately
    expect(mockSetSearchGameValue).not.toHaveBeenCalledWith("Fast Typing");

    // Wait for debounce to complete
    await waitFor(
      () => {
        expect(mockSetSearchGameValue).toHaveBeenCalledWith(
          "Fast Typing Again"
        );
      },
      { timeout: 500 }
    );
  });
});
