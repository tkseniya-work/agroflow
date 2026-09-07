import { useCallback } from "react";
import { ShiftData, WorkType } from "../model/shift.types";
import { useSyncOperations } from "../../../features/dataSync/lib/useSyncOperations";
import {
  TechniqueMonitoringMapping,
  useTechniqueMonitoringActions,
} from "../../../entities/techniqueMonitoring";

const getNonMonitoringTechniqueIds = (response: any): Set<string> | null => {
  if (response == null) return null;

  const source: TechniqueMonitoringMapping[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.techniques)
          ? response.techniques
          : [];

  if (source.length === 0) {
    console.warn("Monitoring mapping returned no techniques", response);
    return new Set();
  }

  const ids = new Set(
    source
      .filter((technique) => {
        const hasMonitoring = technique?.has_monitoring as unknown;

        return (
          technique?.id &&
          (hasMonitoring === false ||
            hasMonitoring === 0 ||
            hasMonitoring === "false")
        );
      })
      .map((technique) => String(technique.id)),
  );

  console.log("Monitoring mapping loaded", {
    techniques: source.length,
    nonMonitoringTechniqueIds: ids.size,
  });

  return ids;
};

export const useProductionShiftUpdate = () => {
  const { push } = useSyncOperations();
  const { loadMonitoringMapping } = useTechniqueMonitoringActions();

  const findLatestShift = async (
    shifts: ShiftData[],
    accessToken: string | null,
    latest: boolean = true,
  ): Promise<ShiftData | ShiftData[] | undefined> => {
    const candidateShifts = shifts.filter((shift) => {
      if (shift.workType === WorkType.None) return false;

      const hasInitialPart = shift.partInitial === true;
      if (!hasInitialPart) return false;

      const openTime = shift.startAt
        ? new Date(shift.startAt).getTime()
        : shift.openAt
          ? new Date(shift.openAt).getTime()
          : 0;

      const closeTime = shift.endAt
        ? new Date(shift.endAt).getTime()
        : shift.closeAt
          ? new Date(shift.closeAt).getTime()
        : openTime;

      const isActive =
        Number.isFinite(openTime) &&
        Number.isFinite(closeTime) &&
        Math.abs(closeTime - openTime) <= 1000;

      return isActive;
    });

    if (candidateShifts.length === 0) {
      return undefined;
    }

    const mappingResponse =
      await loadMonitoringMapping(accessToken);
    const nonMonitoringTechniqueIds =
      getNonMonitoringTechniqueIds(mappingResponse);

    const validShifts = candidateShifts.filter((shift) => {
      if (!shift.techniqueStandardId) {
        return true;
      }

      if (!nonMonitoringTechniqueIds) {
        return false;
      }

      return nonMonitoringTechniqueIds.has(String(shift.techniqueStandardId));
    });

    if (validShifts.length === 0) {
      return undefined;
    }

    if (!latest) {
      return validShifts;
    }

    return validShifts.reduce((latest, current) => {
      const currentTime = new Date(current.startAt || current.openAt).getTime();
      const latestTime = new Date(latest.startAt || latest.openAt).getTime();
      return currentTime > latestTime ? current : latest;
    });
  };

  const closeInitialPartShift = useCallback(
    async (accessToken: string | null, shift: ShiftData, scanedAt: Date) => {
      const partResult = await push.closeInitialPartRequest({
        accessToken,
        productionShiftPartId:
          shift.partIds || "",
        closedAt: scanedAt.toISOString(),
      });

      return partResult;
    },
    [],
  );

  const closeInitialPartShiftByPart = useCallback(
    async (accessToken: string, partId: string, scanedAt: Date) => {
      const partResult = await push.closeInitialPartRequest({
        accessToken,
        productionShiftPartId: partId,
        closedAt: scanedAt.toISOString(),
      });

      return partResult;
    },
    [],
  );

  return {
    findLatestShift,
    closeInitialPartShift,
    closeInitialPartShiftByPart,
  };
};
