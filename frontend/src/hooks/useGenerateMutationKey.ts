const useGenerateMutationKey = () => {
  const getMutateGameKey = (action: "add" | "update" | "delete") => [
    `game-${action}`,
  ];
  const getMutateGameRuleKey = (action: "add" | "update" | "delete") => [
    `gameRule-${action}`,
  ];

  const getMutateGameAttemptKey = (
    action: "add" | "check" | "generate-question"
  ) => ["gameAttempt", action];
  return { getMutateGameKey, getMutateGameRuleKey, getMutateGameAttemptKey };
};

export default useGenerateMutationKey;
