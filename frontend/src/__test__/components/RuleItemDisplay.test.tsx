import RuleItemDisplay from "@/components/RuleItemDisplay/RuleItemDisplay";
import { TBasicGameRule } from "@/models/gameRule";
import { fireEvent, render, screen } from "@testing-library/react";

// ** Test **
describe("RuleItemDisplay Component", () => {
  const mockRule: TBasicGameRule = {
    divisibleNumber: 3,
    replacedWord: "hello",
  };

  const mockOnRemoveRule = jest.fn();
  const renderRuleItemDisplay = (isRemove: boolean = true) =>
    render(
      <RuleItemDisplay
        rule={mockRule}
        index={0}
        onRemoveRule={isRemove ? mockOnRemoveRule : undefined}
      />
    );
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the RuleItemDisplay component correctly with remove btn", () => {
    renderRuleItemDisplay();
    expect(screen.getByText(`Rule 1`)).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='game-rule-3']")
    ).toHaveTextContent("Number: 3 <---> Word: hello");
    // Check if the remove button is present
    expect(screen.getByTestId("remove-rule-3")).toBeInTheDocument();
  });

  it("renders the RuleItemDisplay component correctly without remove btn", () => {
    renderRuleItemDisplay(false);

    // Check if the remove button is not present
    expect(screen.queryByTestId("remove-rule-3")).not.toBeInTheDocument();
  });

  it("calls onRemoveRule when remove button is clicked", () => {
    renderRuleItemDisplay();
    const removeBtn = screen.getByTestId("remove-rule-3");
    fireEvent.click(removeBtn);
    expect(mockOnRemoveRule).toHaveBeenCalledWith(0);
    expect(mockOnRemoveRule).toHaveBeenCalledTimes(1);
  });
});
