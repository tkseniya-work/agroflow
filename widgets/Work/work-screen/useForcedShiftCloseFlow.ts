import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  buildDateTimeFromParts,
  createForcedCloseGroups,
  formatCloseDateTime,
  formatPickerDate,
  formatPickerTime,
  getDefaultCloseDateFromShifts,
  shouldClarifyCloseTime,
} from "../../../src/utils/workShiftUtils";

type ForcedCloseMode = "offline" | "online";

export type OpenForcedCloseModal = (
  shifts: any[],
  onClosed?: () => void,
  blocking?: boolean,
  forceTimeSelection?: boolean,
  mode?: ForcedCloseMode,
) => boolean;

type Params = {
  shiftSettings: any;
  isFocused: boolean;
  isLoading: boolean;
  getExpiredPendingShifts: () => any[];
  closeOfflineShifts: (shifts: any[], closeAt: string) => Promise<any>;
  closeOnlineShifts: (shifts: any[], closeAt: string) => Promise<any>;
  showError: (message: string) => void;
};

const hasClosableShiftId = (shift: any, mode: ForcedCloseMode) => {
  if (mode === "online") {
    return Boolean(
      shift?.productionShiftId ||
        shift?.production_shift_id ||
        shift?.shiftId ||
        shift?.shift_id ||
        shift?.id,
    );
  }

  return Boolean(shift?.id);
};

export function useForcedShiftCloseFlow({
  shiftSettings,
  isFocused,
  isLoading,
  getExpiredPendingShifts,
  closeOfflineShifts,
  closeOnlineShifts,
  showError,
}: Params) {
  const promptedRef = useRef(false);
  const afterCloseRef = useRef<(() => void) | null>(null);
  const queueRef = useRef<any[][]>([]);
  const forceTimeRef = useRef(false);
  const modeRef = useRef<ForcedCloseMode>("offline");

  const [visible, setVisible] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [needsTime, setNeedsTime] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [queueTotal, setQueueTotal] = useState(0);
  const [queueIndex, setQueueIndex] = useState(0);
  const [closeDate, setCloseDate] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [mode, setMode] = useState<ForcedCloseMode>("offline");
  const [isClosing, setIsClosing] = useState(false);

  const showGroup = useCallback(
    (
      nextShifts: any[],
      index: number,
      total: number,
      forceTimeSelection = false,
    ) => {
      const defaultCloseDate = getDefaultCloseDateFromShifts(
        nextShifts,
        shiftSettings,
      );

      setShifts(nextShifts);
      setNeedsTime(
        forceTimeSelection ||
          shouldClarifyCloseTime(nextShifts, shiftSettings),
      );
      setPickerVisible(forceTimeSelection);
      setQueueIndex(index);
      setQueueTotal(total);
      setCloseDate(formatPickerDate(defaultCloseDate));
      setCloseTime(formatPickerTime(defaultCloseDate));
      setVisible(true);
    },
    [shiftSettings],
  );

  const openForcedCloseModal: OpenForcedCloseModal = useCallback(
    (
      candidateShifts: any[],
      onClosed?: () => void,
      _blocking = false,
      forceTimeSelection = false,
      nextMode: ForcedCloseMode = "offline",
    ) => {
      const shiftsToClose = candidateShifts.filter((shift) =>
        hasClosableShiftId(shift, nextMode),
      );

      if (!shiftsToClose.length) {
        onClosed?.();
        return false;
      }

      const groups = createForcedCloseGroups(shiftsToClose, shiftSettings);

      afterCloseRef.current = onClosed ?? null;
      queueRef.current = groups.slice(1);
      forceTimeRef.current = forceTimeSelection;
      modeRef.current = nextMode;
      setMode(nextMode);
      showGroup(groups[0], 1, groups.length, forceTimeSelection);

      return true;
    },
    [shiftSettings, showGroup],
  );

  const closeModal = useCallback(() => {
    setVisible(false);
    setShifts([]);
    setNeedsTime(false);
    setPickerVisible(false);
    setQueueIndex(0);
    setQueueTotal(0);
    setCloseDate("");
    setCloseTime("");
    queueRef.current = [];
    forceTimeRef.current = false;
    modeRef.current = "offline";
    setMode("offline");
    afterCloseRef.current = null;
  }, []);

  const selectedCloseDate = useMemo(
    () => buildDateTimeFromParts(closeDate, closeTime),
    [closeDate, closeTime],
  );

  const executeClose = useCallback(
    async (date: Date) => {
      try {
        setIsClosing(true);
        const onClosed = afterCloseRef.current;
        const closeAt = date.toISOString();

        if (modeRef.current === "online") {
          await closeOnlineShifts(shifts, closeAt);
        } else {
          await closeOfflineShifts(shifts, closeAt);
        }

        const nextGroup = queueRef.current.shift();

        if (nextGroup) {
          showGroup(
            nextGroup,
            queueIndex + 1,
            queueTotal,
            forceTimeRef.current,
          );
        } else {
          closeModal();
          onClosed?.();
        }
      } catch (error) {
        console.error("Error closing shifts:", error);
      } finally {
        setIsClosing(false);
      }
    },
    [
      closeModal,
      closeOfflineShifts,
      closeOnlineShifts,
      queueIndex,
      queueTotal,
      shifts,
      showGroup,
    ],
  );

  const confirmClose = useCallback(() => {
    if (!shifts.length || isClosing) return;

    if (!selectedCloseDate) {
      showError("Укажите корректное время закрытия");
      return;
    }

    if (selectedCloseDate.getTime() > Date.now()) {
      showError("Время закрытия не может быть в будущем");
      return;
    }

    Alert.alert(
      "Подтвердите закрытие",
      mode === "online"
        ? `Закрыть онлайн-смену временем ${formatCloseDateTime(selectedCloseDate)}?`
        : `Закрыть офлайн-отрезки временем ${formatCloseDateTime(selectedCloseDate)}?`,
      [
        { text: "Проверить еще раз", style: "cancel" },
        {
          text: "Да, закрыть",
          style: "destructive",
          onPress: () => {
            void executeClose(selectedCloseDate);
          },
        },
      ],
    );
  }, [executeClose, isClosing, mode, selectedCloseDate, shifts, showError]);

  useEffect(() => {
    if (!isFocused) {
      promptedRef.current = false;
      return;
    }

    if (isLoading || promptedRef.current) return;

    promptedRef.current = true;
    const expiredShifts = getExpiredPendingShifts();

    if (expiredShifts.length) {
      openForcedCloseModal(expiredShifts);
    }
  }, [
    getExpiredPendingShifts,
    isFocused,
    isLoading,
    openForcedCloseModal,
  ]);

  return {
    openForcedCloseModal,
    modalProps: {
      visible,
      shifts,
      mode,
      needsTime,
      pickerVisible,
      queueIndex,
      queueTotal,
      closeDate,
      closeTime,
      selectedCloseDate,
      isClosing,
      onClose: closeModal,
      onConfirm: confirmClose,
      onTogglePicker: () => setPickerVisible((current) => !current),
      onDateTimeChange: ({ date, time }: { date: string; time: string }) => {
        setCloseDate(date);
        setCloseTime(time);
      },
    },
  };
}
