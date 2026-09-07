import { useCallback } from "react";
import { Platform } from "react-native";
import { useLocationPermissions } from "./useLocationPermissions";
import { useLocationProviders } from "./useLocationProviders";
import { useLocationServices } from "./useLocationServices";

export type UserLocationPoint = {
  type: "Point";
  coordinates: [number, number];
};

const normalizeLocation = (location: any): UserLocationPoint | null => {
  const coords = location?.coordinates;

  if (
    !Array.isArray(coords) ||
    coords.length < 2 ||
    typeof coords[0] !== "number" ||
    typeof coords[1] !== "number"
  ) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [coords[0], coords[1]],
  };
};

export const useCurrentLocation = () => {
  const { requestLocationPermission } = useLocationPermissions();
  const { checkGmsAvailability, checkHmsAvailability } = useLocationServices();
  const { getHmsLocation, getGmsLocation, getIosLocation } =
    useLocationProviders();

  const getCurrentLocation = useCallback(async (): Promise<UserLocationPoint | null> => {
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        throw new Error("Geolocation permission not granted");
      }

      let location: any;

      if (Platform.OS === "ios") {
        location = await getIosLocation();
      } else if (Platform.OS === "android") {
        const isGmsAvailable = await checkGmsAvailability();

        if (isGmsAvailable) {
          location = await getGmsLocation();
        } else {
          const isHmsAvailable = await checkHmsAvailability();

          if (isHmsAvailable) {
            location = await getHmsLocation();
          } else {
            // expo-location can still use the Android location provider on devices
            // where neither mobile-services check returns a reliable result.
            location = await getGmsLocation();
          }
        }
      } else {
        throw new Error("The platform is not supported");
      }

      return normalizeLocation(location);
    } catch (error) {
      console.error("Error getting geolocation:", error);
      return null;
    }
  }, [
    requestLocationPermission,
    checkHmsAvailability,
    checkGmsAvailability,
    getHmsLocation,
    getGmsLocation,
    getIosLocation,
  ]);

  return {
    getCurrentLocation,
  };
};
