import { useCallback } from "react";
import { Alert } from "react-native";

type Options = {
  taskId: string;
  isConnected: boolean;
  getValidAccessToken: () => Promise<string | null>;
  updateTaskStatus: (data: {
    accessToken: string;
    productionTaskId: string;
    status: number;
  }) => Promise<boolean>;
  onStatusChanged?: (status: number) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
};

export const useTaskStatusActions = ({
  taskId,
  isConnected,
  getValidAccessToken,
  updateTaskStatus,
  onStatusChanged,
  onReload,
}: Options) => {
  const updateStatus = useCallback(
    async (status: number) => {
      if (!isConnected) {
        Alert.alert(
          "Нет подключения к интернету",
          "Изменение статуса доступно только онлайн.",
        );
        return;
      }

      const accessToken = await getValidAccessToken();
      if (!accessToken) return;

      const success = await updateTaskStatus({
        accessToken,
        productionTaskId: taskId,
        status,
      });

      if (!success) return;

      await onStatusChanged?.(status);
      await onReload?.();
    },
    [
      getValidAccessToken,
      isConnected,
      onReload,
      onStatusChanged,
      taskId,
      updateTaskStatus,
    ],
  );

  const confirmCompleteTask = useCallback(() => {
    Alert.alert(
      "Завершить задание",
      "Вы действительно хотите завершить это задание?",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Завершить", onPress: () => updateStatus(2) },
      ],
    );
  }, [updateStatus]);

  const confirmResumeTask = useCallback(() => {
    Alert.alert(
      "Возобновить задание",
      "Вы действительно хотите возобновить это задание?",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Возобновить", onPress: () => updateStatus(1) },
      ],
    );
  }, [updateStatus]);

  return { confirmCompleteTask, confirmResumeTask };
};
