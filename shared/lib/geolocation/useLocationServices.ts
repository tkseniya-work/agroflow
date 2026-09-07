import { useCallback } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const useLocationServices = () => {
  const checkHmsAvailability = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") return false;

    try {
      return await DeviceInfo.hasHms();
    } catch (error) {
      console.log("HMS not available:", error);
      return false;
    }
  }, []);

  const checkGmsAvailability = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") return false;

    try {
      return await DeviceInfo.hasGms();
    } catch (error) {
      console.log("GMS availability check failed:", error);
      return false;
    }
  }, []);

  return {
    checkHmsAvailability,
    checkGmsAvailability,
  };
};
