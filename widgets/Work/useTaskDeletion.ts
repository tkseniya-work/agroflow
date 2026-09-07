import { useCallback } from "react";
import { Alert } from "react-native";

import type { ProductionTask } from "../../entities/productionTask";

type Options = {
  isConnected: boolean;
  getValidAccessToken: () => Promise<string | null>;
  onDeleteTask?: (data: {
    accessToken: string | null;
    productionTaskId: string;
  }) => Promise<boolean>;
};

const showDeleteError = () => {
  Alert.alert(
    "Не удалось удалить задание",
    "Сервер вернул ошибку. Попробуйте еще раз.",
  );
};

export const useTaskDeletion = ({
  isConnected,
  getValidAccessToken,
  onDeleteTask,
}: Options) =>
  useCallback(
    (item: ProductionTask) => {
      Alert.alert(
        "Удалить задание?",
        "Это действие нельзя отменить.",
        [
          {
            text: "Отмена",
            style: "cancel",
          },
          {
            text: "Удалить",
            style: "destructive",
            onPress: async () => {
              if (!isConnected) {
                Alert.alert(
                  "Нет подключения к интернету",
                  "Удаление задания доступно только онлайн.",
                );
                return;
              }

              try {
                const accessToken = await getValidAccessToken();
                const isDeleted = await onDeleteTask?.({
                  accessToken,
                  productionTaskId: item.id,
                });

                if (isDeleted === false) {
                  showDeleteError();
                }
              } catch (error) {
                console.error("delete task error", error);
                showDeleteError();
              }
            },
          },
        ],
        {
          cancelable: true,
        },
      );
    },
    [getValidAccessToken, isConnected, onDeleteTask],
  );
