import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Colors from "../../../../shared/styles/Colors";

type LoadingProps = {
  bottomInset: number;
  accessibilityLabel?: string;
  title?: string;
  description?: string;
};

export function TaskEditLoading({
  bottomInset,
  accessibilityLabel = "Загрузка страницы редактирования задания",
  title = "Подготавливаем задание",
  description = "Загружаем поля, технику и расходники",
}: LoadingProps) {
  return (
    <ScrollView
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(40, bottomInset + 24) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <ActivityIndicator size="small" color={Colors.greenColor} />
        </View>
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>{title}</Text>
          <Text style={styles.statusDescription}>{description}</Text>
        </View>
      </View>

      <View style={styles.mapSkeleton}>
        <View style={styles.mapPattern}>
          <Ionicons name="map-outline" size={28} color="#98A2B3" />
        </View>
        <View style={styles.mapFooter}>
          <SkeletonLine width="58%" />
          <View style={styles.skeletonCircle} />
        </View>
      </View>

      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={3} />
    </ScrollView>
  );
}

function SkeletonLine({ width }: { width: `${number}%` }) {
  return <View style={[styles.skeletonLine, { width }]} />;
}

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <View style={styles.sectionSkeleton}>
      <View style={styles.sectionHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.sectionTitleSkeleton}>
          <SkeletonLine width="48%" />
          <SkeletonLine width="30%" />
        </View>
      </View>

      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.rowSkeleton}>
          <View style={styles.skeletonCircle} />
          <View style={styles.rowTextSkeleton}>
            <SkeletonLine width={index % 2 === 0 ? "72%" : "56%"} />
            <SkeletonLine width="36%" />
          </View>
        </View>
      ))}
    </View>
  );
}

type ErrorProps = {
  bottomInset: number;
  onRetry: () => void;
  onBack?: () => void;
  title?: string;
  description?: string;
  retryLabel?: string;
};

export function TaskEditLoadError({
  bottomInset,
  onRetry,
  onBack,
  title = "Не удалось загрузить задание",
  description = "Проверьте подключение и попробуйте ещё раз. Внесённые ранее данные не потеряны.",
  retryLabel = "Повторить загрузку",
}: ErrorProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.errorContent,
        { paddingBottom: Math.max(40, bottomInset + 24) },
      ]}
    >
      <View style={styles.errorCard}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={26} color={Colors.error} />
        </View>
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorDescription}>{description}</Text>

        <View style={styles.errorActions}>
          {onBack && (
            <Pressable
              accessibilityRole="button"
              style={[styles.errorButton, styles.backButton]}
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={18} color="#475467" />
              <Text style={styles.backButtonText}>Назад</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            style={[styles.errorButton, styles.retryButton]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={18} color={Colors.white} />
            <Text style={styles.retryButtonText}>{retryLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 14,
  },
  statusCard: {
    borderRadius: 18,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#ABEFC6",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#05603A",
  },
  statusDescription: {
    marginTop: 2,
    fontSize: 12,
    color: "#087443",
  },
  mapSkeleton: {
    height: 260,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#EAECF0",
    overflow: "hidden",
  },
  mapPattern: {
    flex: 1,
    backgroundColor: "#EEF2F4",
    alignItems: "center",
    justifyContent: "center",
  },
  mapFooter: {
    height: 49,
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionSkeleton: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAECF0",
  },
  sectionTitleSkeleton: {
    flex: 1,
    gap: 7,
  },
  rowSkeleton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAECF0",
  },
  rowTextSkeleton: {
    flex: 1,
    gap: 7,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EAECF0",
  },
  errorContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 24,
    alignItems: "center",
  },
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF3F2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color: "#101828",
    textAlign: "center",
  },
  errorDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#667085",
    textAlign: "center",
  },
  errorActions: {
    marginTop: 18,
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  errorButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backButton: {
    backgroundColor: "#F2F4F7",
  },
  backButtonText: {
    color: "#475467",
    fontSize: 14,
    fontWeight: "800",
  },
  retryButton: {
    backgroundColor: Colors.greenColor,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
});
