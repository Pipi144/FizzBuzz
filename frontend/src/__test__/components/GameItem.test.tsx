import { mockGame } from "@/__mocks__/gameHandlers";
import GameItem from "@/components/GameItem/GameItem";
import { Table, TableBody } from "@/components/ui/table";
import { useGameContext } from "@/Providers/GameProvider";
import AppRoutes from "@/RoutePaths";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";

jest.mock("@/Providers/GameProvider", () => ({
  useGameContext: jest.fn(),
}));
const renderGameItem = () =>
  render(
    <Table>
      <TableBody>
        <GameItem game={mockGame} />
      </TableBody>
    </Table>
  );

const mockSetDeletedGame = jest.fn();
const mockUseGameContext = useGameContext as jest.Mock;

// ** Test **
describe("GameItem components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameContext.mockReturnValue({ setDeletedGame: mockSetDeletedGame });
  });
  it("should render the game item correctly", () => {
    renderGameItem();
    const editLink = screen.getByTestId(`edit-game-btn-${mockGame.gameId}`);
    const playLink = screen.getByTestId(`play-game-btn-${mockGame.gameId}`);
    expect(screen.getByText(mockGame.gameName)).toBeInTheDocument();
    expect(
      screen.getByText(`${mockGame.timeLimit} seconds`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(dayjs(mockGame.createdAt).format("DD/MM/YYYY"))
    ).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      "href",
      `${AppRoutes.Game}/${mockGame.gameId}`
    );
    expect(playLink).toHaveAttribute(
      "href",
      `${AppRoutes.Game}/${mockGame.gameId}/play`
    );
  });

  it("calls `setDeletedGame` when delete button is clicked", () => {
    renderGameItem();
    const deleteIcon = screen.getByTestId(`delete-game-btn-${mockGame.gameId}`);
    // Click the delete button
    fireEvent.click(deleteIcon);

    // Ensure `setDeletedGame` was called with the correct game
    expect(mockSetDeletedGame).toHaveBeenCalledTimes(1);
    expect(mockSetDeletedGame).toHaveBeenCalledWith(mockGame);
  });
});
