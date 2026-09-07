import * as Location from "expo-location";
import { useCallback, useRef } from "react";

export const useLocationProviders = () => {
  const hmsInitialized = useRef(false);

  const initializeHms = async () => {
    try {
      console.log("Initializing HMS Location...");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const HMSLocation = require("@hmscore/react-native-hms-location").default;
      await HMSLocation.LocationKit.Native.init();
      hmsInitialized.current = true;
      console.log("HMS Location initialized successfully");
    } catch (error) {
      console.log("HMS Location initialization failed:", error);
      hmsInitialized.current = false;
    }
  };

  const getHmsLocation = useCallback(async () => {
    try {
      if (!hmsInitialized.current) {
        console.log("HMS not initialized, attempting initialization...");
        await initializeHms();
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const HMSLocation = require("@hmscore/react-native-hms-location").default;

      const location = await HMSLocation.FusedLocation.Native.getLastLocation();

      if (
        !location ||
        !Number.isFinite(location.latitude) ||
        !Number.isFinite(location.longitude)
      ) {
        throw new Error("Failed to get HMS location");
      }

      return {
        type: "Point" as const,
        coordinates: [location.longitude, location.latitude],
      };
    } catch (error) {
      console.error("Error getting location via HMS:", error);
      throw error;
    }
  }, []);

  const getExpoLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Geolocation permission not granted");
      }

      const location =
        (await Location.getLastKnownPositionAsync()) ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      const { latitude, longitude } = location.coords;

      return {
        type: "Point" as const,
        coordinates: [longitude, latitude],
      };
    } catch (error) {
      console.error("Error getting location via Expo Location:", error);
      throw error;
    }
  }, []);

  const getGmsLocation = useCallback(async () => {
    return await getExpoLocation();
  }, [getExpoLocation]);

  const getIosLocation = useCallback(async () => {
    return await getExpoLocation();
  }, [getExpoLocation]);

  return {
    getHmsLocation,
    getGmsLocation,
    getIosLocation,
    isHmsAvailable: hmsInitialized.current,
  };
};
