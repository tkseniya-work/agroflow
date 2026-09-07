import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../../shared/styles/Colors";

export type MapDataStatusTone = "loading" | "error" | "info";

type MapDataStatusBannerProps = {
  tone: MapDataStatusTone;
  title: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  onDismiss?: () => void;
};

const MapDataStatusBanner: React.FC<MapDataStatusBannerProps> = ({
  tone,
  title,
  message,
  onRetry,
  actionLabel = "Повторить",
  actionAccessibilityLabel = "Повторить загрузку данных карты",
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const isLoading = tone === "loading";
  const isError = tone === "error";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 6 }]}
    >
      <View
        style={[
          styles.banner,
          isError && styles.errorBanner,
          tone === "info" && styles.infoBanner,
        ]}
      >
        <View style={styles.icon}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.greenColor} />
          ) : (
            <MaterialCommunityIcons
              name={isError ? "alert-circle-outline" : "map-marker-outline"}
              size={21}
              color={isError ? Colors.error : Colors.greenColor}
            />
          )}
        </View>

        <View
          accessible
          accessibilityLiveRegion="polite"
          accessibilityRole={isError ? "alert" : undefined}
          style={styles.content}
        >
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>

        {!!onRetry && !isLoading && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionAccessibilityLabel}
            hitSlop={6}
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryText}>{actionLabel}</Text>
          </Pressable>
        )}

        {!!onDismiss && !isLoading && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Скрыть сообщение карты"
            hitSlop={8}
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={Colors.grey600}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default React.memo(MapDataStatusBanner);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 72,
    zIndex: 40,
  },
  banner: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9E7DE",
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  errorBanner: {
    borderColor: "#F4C7C3",
    backgroundColor: "rgba(255,250,250,0.98)",
  },
  infoBanner: {
    borderColor: "#D7E3F4",
    backgroundColor: "rgba(250,252,255,0.98)",
  },
  icon: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.grey900,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  message: {
    marginTop: 2,
    color: Colors.grey600,
    fontSize: 11,
    lineHeight: 15,
  },
  retryButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  retryText: {
    color: Colors.greenColor,
    fontSize: 12,
    fontWeight: "700",
  },
  dismissButton: {
    width: 28,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.65,
  },
});
