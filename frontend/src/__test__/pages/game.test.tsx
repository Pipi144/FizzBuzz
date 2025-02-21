import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient } from "@tanstack/react-query";
import GameList from "@/app/game/page";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import GameProvider from "@/Providers/GameProvider";
import { mockGameBasicList } from "@/__mocks__/gameHandlers";
import { server } from "@/__mocks__/server";
import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
const createGamePage = () =>
  render(
    <GameProvider>
      <GameList />
    </GameProvider>,
    {
      wrapper: createReactQueryWrapper(queryClient),
    }
  );

const getInteractiveElements = async () => {
  return {
    itemDeleteBtn: screen.getByTestId(
      `delete-game-btn-${mockGameBasicList[0].gameId}`
    ), // msw will return this gameId
    searchInput: screen.getByPlaceholderText("Search game..."),
  };
};

const checkFirstGameItemRender = async (action: "deleted" | "visible") => {
  if (action === "visible") {
    await waitFor(() =>
      expect(
        screen.getByText(mockGameBasicList[0].gameName)
      ).toBeInTheDocument()
    );
  } else
    await waitForElementToBeRemoved(() =>
      screen.getByText(mockGameBasicList[0].gameName)
    );
};

const checkDeleteDialogRender = async (action: "not visible" | "visible") => {
  await waitFor(() => {
    if (action === "visible") {
      expect(screen.getByText(/Confirm delete game/i)).toBeInTheDocument();
    } else {
      expect(
        screen.queryByText(/Confirm delete game/i)
      ).not.toBeInTheDocument();
    }
  });
};
describe("game page", () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
    queryClient.clear();
  });
  it("should render the game page correctly", async () => {
    createGamePage();
    const addLinkBtn = screen.getByTestId("add-game-link");
    expect(addLinkBtn).toBeInTheDocument();

    // fetching and rendering game list
    await checkFirstGameItemRender("visible");
  });
  it("opens and closes confirm delete dialog", async () => {
    createGamePage();

    // wait for the first item is rendered
    await checkFirstGameItemRender("visible");

    const { itemDeleteBtn } = await getInteractiveElements();

    // click on delete button in the first item
    fireEvent.click(itemDeleteBtn);

    // Check if the confirm dialog is open
    await checkDeleteDialogRender("visible");

    // Click the cancel button
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Ensure setDeletedGame is called
    await checkDeleteDialogRender("not visible");
  });

  it("calls delete mutation when clicking Delete => remove deleted item and close dialog", async () => {
    server.use(
      http.delete(`${baseAddress}/api/Game/:gameId`, async ({}) => {
        return HttpResponse.json({ status: 204 });
      })
    );
    createGamePage();

    // wait for the first item is rendered
    await checkFirstGameItemRender("visible");

    const { itemDeleteBtn } = await getInteractiveElements();

    // click on delete button in the first item
    fireEvent.click(itemDeleteBtn);

    // wait for the confirm dialog is open
    await checkDeleteDialogRender("visible");

    const confirmDeleteBtn = screen.getByTestId("confirm-delete-btn");
    // expect confirm delete btn is visible
    expect(confirmDeleteBtn).toBeInTheDocument();

    // click delete btn
    fireEvent.click(confirmDeleteBtn);

    // event success

    await checkFirstGameItemRender("deleted");

    // wait for the confirm dialog is closed
    await checkDeleteDialogRender("not visible");
  });
});
