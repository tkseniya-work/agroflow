export type NetworkStatus =
  | "online"
  | "offline"
  | "limited"
  | "service-unavailable";

export const probeWithRetry = async (
  probe: () => Promise<boolean>,
  attempts = 2,
) => {
  const attemptsCount = Math.max(1, attempts);

  for (let attempt = 0; attempt < attemptsCount; attempt += 1) {
    if (await probe()) return true;
  }

  return false;
};

export const resolveReachableNetworkStatus = (
  isAppApiReachable: boolean,
  independentProbeResults: boolean[],
): NetworkStatus => {
  if (isAppApiReachable) return "online";

  return independentProbeResults.some(Boolean)
    ? "service-unavailable"
    : "limited";
};
