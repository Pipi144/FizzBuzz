import { server } from "@/__mocks__/server";
import { baseAddress } from "@/baseAddress";
import GameTable from "@/components/GameTable/GameTable";
import GameProvider from "@/Providers/GameProvider";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import { render, waitFor, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "@/hooks/use-toast";

// ✅ Mock the toast function
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
const renderGameTable = () =>
  render(
    <GameProvider>
      <GameTable />
    </GameProvider>,
    {
      wrapper: createReactQueryWrapper(queryClient),
    }
  );

// ** Test **
describe("GameTable components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();
  });

  it("renders game table and fetches data from API", async () => {
    renderGameTable();

    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByText("Game 1")).toBeInTheDocument();
      expect(screen.getByText("Game 2")).toBeInTheDocument();
    });

    // Ensure table headers are visible
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Created at")).toBeInTheDocument();
    expect(screen.getByText("Time limit")).toBeInTheDocument();

    // Check total game count
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("2 games")).toBeInTheDocument();
  });

  it("handles empty state correctly", async () => {
    // Override MSW to return an empty array
    server.use(
      http.get(`${baseAddress}/api/Game`, async () => {
        return HttpResponse.json([], { status: 200 });
      })
    );
    renderGameTable();

    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText(/0 game/i)).toBeInTheDocument();
    });
  });

  it("shows a toast when API call fails", async () => {
    // Override MSW to return an error response
    server.use(
      http.get(`${baseAddress}/api/Game`, async () => {
        return HttpResponse.json(
          { message: "Error fetching games" },
          { status: 500 }
        );
      })
    );

    renderGameTable();

    // Wait for the error to trigger
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to get games",
          description: "Error fetching games",
        })
      );
    });
  });
});
