import * as Location from 'expo-location';
import { useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useLocationPermissions = () => {
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Разрешение на доступ к местоположению",
            message: "Приложение нуждается в доступе к вашему местоположению",
            buttonNeutral: "Спросить позже",
            buttonNegative: "Отмена",
            buttonPositive: "ОК",
          }
        );
        return granted === "granted";
      } else if (Platform.OS === 'ios') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          return status === 'granted';
        } catch {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    requestLocationPermission,
  };
};
