import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Colors from "../../../shared/styles/Colors";
import { useMapCamera } from "../useMapCamera";
import { getBoundsCenter } from "../../../src/utils/mapUtils";
import { OfflineRegion, OfflineTabProps } from "../../../src/types/map.types";
import { useNetworkStatus } from "../../../shared/lib/useNetworkStatus";

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatSavedDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const OfflineTab: React.FC<OfflineTabProps> = ({
  companyInfo,
  regions,
  downloadStates = {},
  cameraRef,
  setInteractionMode,
  collapsePanel,
  deleteRegion,
}) => {
  const [deletingRegionId, setDeletingRegionId] = useState<string | null>(null);
  const { isConnected } = useNetworkStatus();
  const { focus } = useMapCamera({
    companyLocation: companyInfo ? companyInfo.location : null,
  });

  const handleNavigateToRegion = (region: OfflineRegion) => {
    collapsePanel?.();
    
    const center =
      region.metadata?.actualCenter ?? getBoundsCenter(region.bounds);
    const zoom = region.metadata?.actualZoom ?? 11;

    focus(center, zoom);

    cameraRef?.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: zoom,
      animationDuration: 1000,
    });
  };

  const handleCollapsePanel = () => {
    if (!isConnected) {
      Alert.alert(
        "Нет подключения к интернету",
        "Новую область можно скачать после восстановления соединения.",
      );
      return;
    }

    setInteractionMode("selectRegion");
    collapsePanel?.();
  };

  const handleDeleteRegion = async (region: OfflineRegion) => {
    if (deletingRegionId) return;

    setDeletingRegionId(region.id);

    try {
      await deleteRegion(region.id);
    } catch (error) {
      console.error("Error deleting offline region:", error);
      Alert.alert(
        "Не удалось удалить область",
        "Попробуйте ещё раз. Сохранённая карта осталась на устройстве.",
      );
    } finally {
      setDeletingRegionId(null);
    }
  };

  const confirmDeleteRegion = (region: OfflineRegion) => {
    const regionName = region.metadata?.name || region.name || "Регион";

    Alert.alert(
      "Удалить офлайн-область?",
      `Карта «${regionName}» больше не будет доступна без интернета.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            void handleDeleteRegion(region);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            Офлайн-карты
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {regions.length > 0
              ? `Сохранено областей: ${regions.length}`
              : "Сохраните нужную область заранее"}
          </Text>
        </View>
      </View>

      {!isConnected && (
        <View style={styles.offlineNotice}>
          <MaterialIcons name="cloud-off" size={18} color="#8A5A00" />
          <Text style={styles.offlineNoticeText}>
            Сохранённые карты доступны. Для скачивания новой нужен интернет.
          </Text>
        </View>
      )}

      {regions.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Скачать новую область карты"
          accessibilityState={{ disabled: !isConnected }}
          disabled={!isConnected}
          onPress={handleCollapsePanel}
          style={({ pressed }) => [
            styles.downloadButton,
            !isConnected && styles.downloadButtonDisabled,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <MaterialIcons
            name="download"
            size={18}
            color={isConnected ? Colors.greenColor : Colors.grey500}
          />
          <Text
            style={[
              styles.downloadButtonText,
              !isConnected && styles.downloadButtonTextDisabled,
            ]}
          >
            Скачать область
          </Text>
        </Pressable>
      )}

      <View style={styles.listContent}>
        {regions.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons
              name="offline-pin"
              size={22}
              color={Colors.grey500 || "#98A2B3"}
            />
            <Text style={styles.emptyTitle}>Нет сохранённых регионов</Text>
            <Text style={styles.emptySubtitle}>
              Выберите участок на карте, чтобы пользоваться им без интернета
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isConnected }}
              disabled={!isConnected}
              onPress={handleCollapsePanel}
              style={({ pressed }) => [
                styles.emptyAction,
                !isConnected && styles.downloadButtonDisabled,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <MaterialIcons
                name="download"
                size={18}
                color={isConnected ? Colors.greenColor : Colors.grey500}
              />
              <Text
                style={[
                  styles.emptyActionText,
                  !isConnected && styles.downloadButtonTextDisabled,
                ]}
              >
                Скачать область
              </Text>
            </Pressable>
          </View>
        ) : (
          regions.map((region) => {
            const regionName = region.metadata?.name || region.name || "Регион";
            const address = region.metadata?.fullAddress;
            const downloadState = downloadStates[region.id];
            const status = downloadState?.status ?? "complete";
            const size = formatBytes(
              downloadState?.completedResourceSize ||
                region.metadata?.completedResourceSize,
            );
            const savedDate = formatSavedDate(region.metadata?.downloadedAt);

            return (
              <View key={region.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.regionIcon}>
                    <MaterialIcons
                      name={status === "error" ? "error-outline" : "map"}
                      size={20}
                      color={status === "error" ? "#B3261E" : Colors.greenColor}
                    />
                  </View>

                  <View style={styles.mainInfo}>
                    <Text style={styles.regionName} numberOfLines={1}>
                      {regionName}
                    </Text>

                    {!!address && (
                      <Text style={styles.regionAddress} numberOfLines={2}>
                        {address}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Удалить офлайн-область ${regionName}`}
                    disabled={deletingRegionId !== null}
                    onPress={(event) => {
                      event?.stopPropagation?.();
                      confirmDeleteRegion(region);
                    }}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {deletingRegionId === region.id ? (
                      <ActivityIndicator
                        accessibilityLabel="Удаление офлайн-области"
                        size="small"
                        color={Colors.grey500 || "#98A2B3"}
                      />
                    ) : (
                      <MaterialIcons
                        name="delete-outline"
                        size={19}
                        color={Colors.grey500 || "#98A2B3"}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {status === "downloading" && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Скачивание</Text>
                      <Text style={styles.progressValue}>
                        {downloadState?.percentage ?? 0}%
                        {size ? ` · ${size}` : ""}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${downloadState?.percentage ?? 0}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {status === "error" && (
                  <Text style={styles.downloadError}>
                    {downloadState?.error || "Не удалось скачать область"}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.statusBlock}>
                    {status === "complete" && (
                      <View style={styles.readyBadge}>
                        <MaterialIcons
                          name="check-circle"
                          size={15}
                          color={Colors.greenColor}
                        />
                        <Text style={styles.readyText}>Доступно офлайн</Text>
                      </View>
                    )}
                    {!!size && status === "complete" && (
                      <Text style={styles.metaText}>
                        {size}{savedDate ? ` · ${savedDate}` : ""}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Открыть офлайн-область ${regionName}`}
                    disabled={status !== "complete"}
                    onPress={() => handleNavigateToRegion(region)}
                    style={({ pressed }) => [
                      styles.openButton,
                      status !== "complete" && styles.openButtonDisabled,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.openText}>Открыть</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={12}
                      color={Colors.grey700}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101828",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#98A2B3",
  },

  downloadButton: {
    minHeight: 46,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B8DEC4",
    backgroundColor: Colors.greenColorLight,
  },

  actionButtonPressed: {
    opacity: 0.72,
  },

  downloadButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.greenColor,
  },

  downloadButtonDisabled: {
    opacity: 0.55,
  },

  downloadButtonTextDisabled: {
    color: Colors.grey500,
  },

  offlineNotice: {
    marginBottom: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#FFF7E6",
  },

  offlineNoticeText: {
    flex: 1,
    color: "#7A5100",
    fontSize: 12,
    lineHeight: 16,
  },

  listContent: {
    paddingBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7ECF2",
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: "#101828",
    textAlign: "center",
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#98A2B3",
    textAlign: "center",
  },

  emptyAction: {
    minHeight: 44,
    marginTop: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#B8DEC4",
    borderRadius: 12,
    backgroundColor: Colors.greenColorLight,
  },

  emptyActionText: {
    color: Colors.greenColor,
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7ECF2",
    padding: 14,
    marginBottom: 10,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  mainInfo: {
    flex: 1,
  },

  regionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.greenColorLight,
    alignItems: "center",
    justifyContent: "center",
  },

  regionName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: "#101828",
  },

  regionAddress: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#667085",
  },

  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  metaText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#98A2B3",
  },

  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  statusBlock: {
    flex: 1,
    minWidth: 0,
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  readyText: {
    color: Colors.greenColor,
    fontSize: 12,
    fontWeight: "700",
  },

  openButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#DDE2DF",
    borderRadius: 11,
    backgroundColor: "#F7F8F7",
  },

  openButtonDisabled: {
    opacity: 0.45,
  },

  openText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.grey800,
  },

  progressSection: {
    marginTop: 14,
  },

  progressHeader: {
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    color: Colors.grey600,
    fontSize: 12,
  },

  progressValue: {
    color: Colors.grey800,
    fontSize: 12,
    fontWeight: "700",
  },

  progressTrack: {
    height: 7,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.greenColor,
  },

  downloadError: {
    marginTop: 12,
    color: "#B3261E",
    fontSize: 12,
    lineHeight: 16,
  },
});
