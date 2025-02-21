import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddGameRule from "@/components/AddGameRule/AddGameRule";

import { useGameContext } from "@/Providers/GameProvider";
import { toast } from "@/hooks/use-toast";

// mock modules
jest.mock("@/Providers/GameProvider", () => ({
  useGameContext: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// mock data
const mockSetAddGamePayload = jest.fn();
const mockUseGameContext = useGameContext as jest.Mock;

const getInteractiveElements = () => ({
  addRuleBtn: screen.getByRole("button", { name: /add rule/i }),
  numberInput: screen.getByPlaceholderText("Enter divisible number"),
  wordInput: screen.getByPlaceholderText("Enter replaced word"),
});
const renderAddGameRule = () => {
  render(<AddGameRule />);
};

// ** Test **
describe("AddGameRule Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameContext.mockReturnValue({
      addGamePayload: { gameRules: [] },
      setAddGamePayload: mockSetAddGamePayload,
    });
  });
  it("prevents adding a rule when fields are empty, show toast error", async () => {
    renderAddGameRule();

    const { addRuleBtn } = getInteractiveElements();

    fireEvent.click(addRuleBtn);

    // Expect the setAddGamePayload function not to be called

    expect(mockSetAddGamePayload).not.toHaveBeenCalled();

    // Expect the toast notification to appear
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Fields are required",
          description: "Please fill in all fields",
        })
      );
    });
  });

  it("adds a rule when valid inputs are provided", async () => {
    renderAddGameRule();

    const { addRuleBtn, numberInput, wordInput } = getInteractiveElements();

    fireEvent.change(numberInput, { target: { value: "3" } });
    fireEvent.change(wordInput, { target: { value: "Fizz" } });

    fireEvent.click(addRuleBtn);

    // Expect the setAddGamePayload function to be called
    await waitFor(() => {
      expect(mockSetAddGamePayload).toHaveBeenCalled();
    });

    // Expect fields to be reset after adding
    expect(numberInput).toHaveValue(null); // due to the type="number" attribute
    expect(wordInput).toHaveValue("");
  });

  it("prevents adding duplicate rules", async () => {
    mockUseGameContext.mockReturnValue({
      addGamePayload: {
        gameRules: [{ divisibleNumber: 3, replacedWord: "Fizz" }],
      },
      setAddGamePayload: mockSetAddGamePayload,
    });

    renderAddGameRule();

    const { addRuleBtn, numberInput, wordInput } = getInteractiveElements();

    fireEvent.change(numberInput, { target: { value: "3" } });
    fireEvent.change(wordInput, { target: { value: "Buzz" } });

    fireEvent.click(addRuleBtn);

    expect(mockSetAddGamePayload).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Rule already exists",
          description: "Rule with this divisible number already exists",
        })
      );
    });
  });

  it("removes a rule when delete is clicked", async () => {
    mockUseGameContext.mockReturnValue({
      addGamePayload: {
        gameRules: [{ divisibleNumber: 5, replacedWord: "Buzz" }],
      },
      setAddGamePayload: mockSetAddGamePayload,
    });

    renderAddGameRule();

    // get the remove btn in rule item
    const deleteRuleButton = screen.getByTestId("remove-rule-5");

    fireEvent.click(deleteRuleButton);

    // expect the setAddGamePayload function to be called
    await waitFor(() => {
      expect(mockSetAddGamePayload).toHaveBeenCalledTimes(1);
    });
  });
});
