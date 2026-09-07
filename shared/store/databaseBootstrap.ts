import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { useLocalDataLoaders } from "../../features/localData/useLocalDataLoaders";

const isReloadingLocalDataAtom = atom(false);
const isLocalDataInitializedAtom = atom(false);
const localDataBootstrapErrorAtom = atom(null as string | null);

let isLoading = false;
let initStarted = false;

export function useDatabaseBootstrap() {
  const localDataLoaders = useLocalDataLoaders();

  const [isReloadingLocalData, setIsReloadingLocalData] = useAtom(
    isReloadingLocalDataAtom,
  );
  const [isLocalDataInitialized, setIsLocalDataInitialized] = useAtom(
    isLocalDataInitializedAtom,
  );
  const [localDataBootstrapError, setLocalDataBootstrapError] = useAtom(
    localDataBootstrapErrorAtom,
  );

  const reloadLocalData = useCallback(async (): Promise<boolean> => {
    if (isLoading) {
      return false;
    }

    isLoading = true;
    setIsReloadingLocalData(true);
    setLocalDataBootstrapError(null);

    try {
      const results = await Promise.allSettled(
        localDataLoaders.map(({ load }) => load()),
      );

      const successfulLoads = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failedLoads = results
        .map((result, index) => ({
          key: localDataLoaders[index]?.key ?? `loader-${index}`,
          result,
        }))
        .filter(
          (
            item,
          ): item is {
            key: string;
            result: PromiseRejectedResult;
          } => item.result.status === "rejected",
        );

      if (failedLoads.length > 0) {
        failedLoads.forEach(({ key, result }) => {
          console.error(`Failed to load local data "${key}":`, result.reason);
        });
      }

      console.log(
        `Successfully loaded ${successfulLoads}/${results.length} data tables`,
      );

      setLocalDataBootstrapError(
        failedLoads.length > 0
          ? `Failed local data loaders: ${failedLoads
              .map(({ key }) => key)
              .join(", ")}`
          : null,
      );

      return successfulLoads > 0;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading local data";

      console.error("Error loading data:", err);
      setLocalDataBootstrapError(errorMessage);

      return false;
    } finally {
      isLoading = false;
      setIsReloadingLocalData(false);
      setIsLocalDataInitialized(true);
    }
  }, [
    localDataLoaders,
    setIsReloadingLocalData,
    setLocalDataBootstrapError,
    setIsLocalDataInitialized,
  ]);

  useEffect(() => {
    if (initStarted || isLocalDataInitialized) {
      return;
    }

    initStarted = true;

    void reloadLocalData();
  }, [isLocalDataInitialized, reloadLocalData]);

  return {
    reloadLocalData,
    isReloadingLocalData,
    isLocalDataInitialized,
    localDataBootstrapError,
  };
}
