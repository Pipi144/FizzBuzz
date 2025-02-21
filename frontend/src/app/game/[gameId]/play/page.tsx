"use client";

import GameAnswer from "@/components/GameAnswer/GameAnswer";
import GameTimer from "@/components/GameTimer/GameTimer";
import { toast } from "@/hooks/use-toast";
import useGetGameDetail from "@/hooks/useGetGameDetail";
import GamePlayProvider from "@/Providers/GamePlayProvider";
import { useParams } from "next/navigation";
import React from "react";

const PlayGame = () => {
  const { gameId } = useParams<{
    gameId: string;
  }>();
  const gameDetailQuery = useGetGameDetail({
    gameId,
    onErrorGetGameDetail(error) {
      toast({
        title: "Failed to get game details",
        description: error.message,
      });
    },
  });
  const gameData = gameDetailQuery.data;

  if (gameDetailQuery.isLoading)
    return <div data-testid="game-details-loader">Loading game...</div>;
  if (!gameData) return <div>Game not found</div>;

  return (
    <GamePlayProvider game={gameData}>
      <div className="flex w-full h-full flex-col px-[20px] items-center max-w-2xl">
        <h3 className="text-lg md:text-2xl font-bold font-concert">
          Play game
        </h3>
        <GameTimer />
        <GameAnswer />
      </div>
    </GamePlayProvider>
  );
};

export default PlayGame;
