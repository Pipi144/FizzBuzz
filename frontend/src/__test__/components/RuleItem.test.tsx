import { server } from "@/__mocks__/server";
import { baseAddress } from "@/baseAddress";
import RuleItem from "@/components/RuleItem/RuleItem";
import { toast } from "@/hooks/use-toast";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { TGameRule } from "@/models/gameRule";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

// mock modules
jest.mock("@/hooks/useSetGameQueryData");

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// mock data

const mockEditGameRuleQueryData = jest.fn();
const mockDeleteGameRuleQueryData = jest.fn();
jest.mock("@/components/ui/spinner", () => {
  const MockSpinner = () => <div data-testid="loader">delete loader...</div>;
  MockSpinner.displayName = "MockSpinner";
  return MockSpinner;
});
// mock game rule
const mockGameRule: TGameRule = {
  ruleId: "100",
  divisibleNumber: 3,
  replacedWord: "hello",
  gameId: "100",
};

// render game rule item
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
const renderRuleItem = () =>
  render(<RuleItem rule={mockGameRule} index={0} />, {
    wrapper: createReactQueryWrapper(queryClient),
  });

const getInteractiveElements = () => ({
  divisibleNumberInput: screen.getByPlaceholderText("Enter divisible number"),
  replacedWordInput: screen.getByPlaceholderText("Enter replaced word"),
  updateBtn: screen.getByRole("button", { name: /update/i }),
  deleteBtn: screen.getByTestId(`delete-rule-${mockGameRule.divisibleNumber}`),
});

const changeRuleInput = (divisibleNumber: number, replaceWord: string) => {
  const { divisibleNumberInput, replacedWordInput } = getInteractiveElements();
  fireEvent.change(replacedWordInput, { target: { value: replaceWord } });
  fireEvent.change(divisibleNumberInput, {
    target: { value: divisibleNumber },
  });
};

// ** Test **
describe("RuleItem component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();

    // mock useSetGameQueryData
    (useSetGameQueryData as jest.Mock).mockReturnValue({
      editGameRuleQueryData: mockEditGameRuleQueryData,
      deleteGameRuleQueryData: mockDeleteGameRuleQueryData,
    });
  });
  it("should render RuleItem correctly", () => {
    renderRuleItem();

    const { divisibleNumberInput, replacedWordInput, updateBtn, deleteBtn } =
      getInteractiveElements();

    // check if the input fields are rendered with the correct values
    expect(divisibleNumberInput).toHaveValue(mockGameRule.divisibleNumber);
    expect(replacedWordInput).toHaveValue(mockGameRule.replacedWord);

    // check if the update button is rendered
    expect(updateBtn).toBeInTheDocument();

    // check if the delete button is rendered
    expect(deleteBtn).toBeInTheDocument();

    // rule index is rendered correctly
    expect(screen.getByText(`Rule 1:`)).toBeInTheDocument();

    // update btn should be disabled if no changes are made
    expect(updateBtn).toBeDisabled();
  });

  it("update btn should be enabled when input fields not matching original rule item", () => {
    renderRuleItem();

    const { updateBtn } = getInteractiveElements();

    // change the value of the input fields
    changeRuleInput(4, "world");

    // check if the update button is enabled
    expect(updateBtn).toBeEnabled();
  });

  it("update btn should be disabled when input fields matching original rule item", () => {
    renderRuleItem();

    const { updateBtn } = getInteractiveElements();

    // change input not matching the original rule item
    changeRuleInput(1000, "change input");

    // update btn should be enabled
    expect(updateBtn).toBeEnabled();

    // change input matching the original rule item
    changeRuleInput(mockGameRule.divisibleNumber, mockGameRule.replacedWord);

    // update button should be disabled
    expect(updateBtn).toBeDisabled();
  });

  it("should show toast error when fields are empty", () => {
    renderRuleItem();

    const { updateBtn } = getInteractiveElements();

    // change the value of the input fields
    changeRuleInput(0, "");

    // click the update button
    fireEvent.click(updateBtn);

    // check if the toast error is shown
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Please fill in all fields",
      })
    );
  });

  it("update rule success => should call editGameRule to update query data", async () => {
    // mock success edit game rule api
    server.use(
      http.patch(
        `${baseAddress}/api/GameRule/${mockGameRule.ruleId}`,
        async () => {
          return HttpResponse.json(mockGameRule, { status: 200 });
        }
      )
    );
    renderRuleItem();

    const { updateBtn } = getInteractiveElements();

    // change the value of the input fields
    changeRuleInput(4, "world");

    // click the update button
    fireEvent.click(updateBtn);

    // check if editGameRule is called with the correct arguments
    await waitFor(() =>
      expect(mockEditGameRuleQueryData).toHaveBeenCalledWith(
        expect.objectContaining(mockGameRule)
      )
    );
  });
  it("update rule failed => should call toast with error message", async () => {
    // mock failed edit game rule api
    server.use(
      http.patch(
        `${baseAddress}/api/GameRule/${mockGameRule.ruleId}`,
        async () => {
          return HttpResponse.json(
            { message: "Update failed" },
            { status: 401 }
          );
        }
      )
    );
    renderRuleItem();

    const { updateBtn } = getInteractiveElements();

    // change the value of the input fields
    changeRuleInput(4, "world");

    // click the update button
    fireEvent.click(updateBtn);

    // check if editGameRule is called with the correct arguments
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Edit failed",
          description: "Update failed",
        })
      )
    );
  });
  it("delete rule success => should deleteGameRuleQueryData to delete from query data ", async () => {
    // mock success delete game rule api
    server.use(
      http.delete(
        `${baseAddress}/api/GameRule/${mockGameRule.ruleId}`,
        async () => {
          return HttpResponse.json({ status: 204 });
        }
      )
    );
    renderRuleItem();

    const { deleteBtn } = getInteractiveElements();

    // click the delete button
    fireEvent.click(deleteBtn);

    // check if deleteGameRule is called with the correct arguments
    await waitFor(() =>
      expect(mockDeleteGameRuleQueryData).toHaveBeenCalledWith(mockGameRule)
    );
  });

  it("delete rule failed => should call toast with error message", async () => {
    // mock failed edit game rule api
    server.use(
      http.delete(
        `${baseAddress}/api/GameRule/${mockGameRule.ruleId}`,
        async () => {
          return HttpResponse.json(
            { message: "Delete rule failed" },
            { status: 401 }
          );
        }
      )
    );
    renderRuleItem();

    const { deleteBtn } = getInteractiveElements();

    // click the delete button
    fireEvent.click(deleteBtn);

    // check if deleteGameRule is called with the correct arguments
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Delete failed",
          description: "Delete rule failed",
        })
      )
    );
  });
});
