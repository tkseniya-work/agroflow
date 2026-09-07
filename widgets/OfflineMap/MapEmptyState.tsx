import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "../../shared/styles/Colors";

type MapEmptyStateProps = {
  icon:
    | "map-marker-radius-outline"
    | "image-off-outline"
    | "calendar-search";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const MapEmptyState: React.FC<MapEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View
      accessibilityLabel={`${title}. ${description}`}
      style={styles.container}
    >
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={Colors.greenColor}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {!!actionLabel && !!onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default React.memo(MapEmptyState);

const styles = StyleSheet.create({
  container: {
    minHeight: 138,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E4E9EE",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  icon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 21,
    backgroundColor: Colors.greenColorLight,
  },
  title: {
    color: Colors.grey900,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    marginTop: 5,
    color: Colors.grey600,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  actionButton: {
    minHeight: 44,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPressed: {
    opacity: 0.75,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
