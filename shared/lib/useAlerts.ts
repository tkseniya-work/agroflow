import { useCallback } from 'react';
import { Alert } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const useAlerts = () => {
  const showAlert = useCallback((title: string, message: string, buttons: AlertButton[] = [{ text: "OK" }]) => {
    Alert.alert(title, message, buttons);
  }, []);

  const showError = useCallback((message: string, onRetry?: () => void) => {
    const buttons: AlertButton[] = [{ text: "OK" }];
    
    if (onRetry) {
      buttons.unshift({
        text: "Повторить",
        onPress: onRetry
      });
    }

    Alert.alert("❌ Ошибка", message, buttons);
  }, []);

  const showSuccess = useCallback((message: string, buttons?: AlertButton[]) => {
    Alert.alert("✅ Успешно", message, buttons || [{ text: "OK" }]);
  }, []);

  const showWarning = useCallback((message: string, buttons?: AlertButton[]) => {
    Alert.alert("⚠️ Предупреждение", message, buttons || [{ text: "OK" }]);
  }, []);

   const showOtherInformation = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    Alert.alert(title, message, buttons || [{ text: "OK" }]);
  }, []);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const buttons: AlertButton[] = [
      {
        text: "Отмена",
        style: "cancel",
        onPress: onCancel
      },
      {
        text: "Подтвердить",
        onPress: onConfirm
      }
    ];

    Alert.alert(title, message, buttons);
  }, []);

  const showOfflineWarning = useCallback((onContinue: () => void) => {
    Alert.alert(
      "⚠️ Нет подключения к интернету",
      "Данные будут сохранены на устройстве и автоматически отправлены на сервер, как только появится интернет.\n\nПродолжить?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Продолжить оффлайн", 
          style: "default", 
          onPress: onContinue 
        },
      ]
    );
  }, []);

  return {
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showOtherInformation,
    showConfirmation,
    showOfflineWarning,
  };
};