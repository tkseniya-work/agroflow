import { EMPTY_MESSAGES } from "../../src/constants/work";
import React from "react";
import { Text, View } from "react-native";
import { ArchiveTabProps } from "../../src/types/work.types";

const styles = {
  centeredContainer: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
};

export const ArchiveTab: React.FC<ArchiveTabProps> = ({
  isLoading,
  isConnected,
  hasArchiveData,
  grouped,
  keys,
  renderShiftGroups,
}) => {
  if (isLoading && isConnected) {
    return (
      <View style={styles.centeredContainer}>
        <Text>{EMPTY_MESSAGES.loading}</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: '#999' }}>{EMPTY_MESSAGES.archiveOffline}</Text>
      </View>
    );
  }

  if (!hasArchiveData) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: '#999' }}>{EMPTY_MESSAGES.archive}</Text>
      </View>
    );
  }

  return renderShiftGroups(
    grouped,
    keys,
    EMPTY_MESSAGES.archive,
    false
  );
};