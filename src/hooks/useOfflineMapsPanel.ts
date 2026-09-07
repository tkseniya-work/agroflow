import { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UseOfflineMapsPanelProps {
  showPanel: boolean;
  onPanelChange?: (show: boolean) => void;
  panelHeight?: number;
  maxPanelHeight?: number | string;
}

export const useOfflineMapsPanel = ({
  showPanel,
  onPanelChange,
  panelHeight = 60,
  maxPanelHeight = SCREEN_HEIGHT * 0.4,
}: UseOfflineMapsPanelProps) => {
  const panelHeightAnim = useRef(new Animated.Value(panelHeight)).current;
  const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;
  const contentOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const openHeight = typeof maxPanelHeight === 'string' 
      ? parseFloat(maxPanelHeight) * SCREEN_HEIGHT 
      : maxPanelHeight;

    if (showPanel) {
      Animated.parallel([
        Animated.timing(panelHeightAnim, {
          toValue: openHeight,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonsOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(panelHeightAnim, {
          toValue: panelHeight,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonsOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }

    if (onPanelChange) {
      onPanelChange(showPanel);
    }
  }, [showPanel]);

  return {
    panelHeightAnim,
    buttonsOpacityAnim,
    contentOpacityAnim,
  };
};