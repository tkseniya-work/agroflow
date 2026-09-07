import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import React, { type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import Colors from "../../../shared/styles/Colors";
import {
  formatTaskInfoNumber,
  getTaskInfoInitials,
  getTaskInfoStatusPalette,
} from "./TaskInfoCard.logic";
import { taskInfoCardStyles as styles } from "./TaskInfoCard.styles";

type TaskInfoCardLayoutProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  statusId?: number;
  statusLabel?: string | null;
  children: ReactNode;
};

export const TaskInfoCardLayout = ({
  icon,
  title,
  subtitle,
  statusId,
  statusLabel,
  children,
}: TaskInfoCardLayoutProps) => {
  const statusPalette = getTaskInfoStatusPalette(statusId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={Colors.greenColor} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusPalette.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusPalette.color }]}>
            {statusLabel ?? "Статус"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      {children}
    </View>
  );
};

export const TaskInfoLoadingCard = () => (
  <View style={[styles.card, styles.loadingCard]}>
    <ActivityIndicator color={Colors.greenColor} />
    <Text style={styles.loadingText}>Загружаем информацию о задании</Text>
  </View>
);

export const TaskInfoErrorCard = () => (
  <View style={styles.card}>
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={22} color={Colors.error} />
      <Text style={styles.emptyTitle}>Не удалось загрузить задание</Text>
    </View>
  </View>
);

export const TaskInfoGrid = ({ children }: { children: ReactNode }) => (
  <View style={styles.grid}>{children}</View>
);

type TaskInfoItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  fullWidth?: boolean;
};

export const TaskInfoItem = ({
  icon,
  label,
  value,
  fullWidth = false,
}: TaskInfoItemProps) => (
  <View style={[styles.infoItem, fullWidth && styles.infoItemFull]}>
    <Ionicons name={icon} size={17} color={Colors.grey600} />
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export const TaskInfoProgress = ({ progress }: { progress: number }) => {
  if (!Number.isFinite(progress) || progress <= 0) return null;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Прогресс выполнения</Text>
        <Text style={styles.progressValue}>
          {formatTaskInfoNumber(progress, "%")}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>
    </View>
  );
};

const TaskInfoPersonBadge = ({
  label,
  name,
}: {
  label: string;
  name?: string | null;
}) => (
  <View style={styles.personBadge}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getTaskInfoInitials(name)}</Text>
    </View>
    <View style={styles.personTextWrap}>
      <Text style={styles.personLabel}>{label}</Text>
      <Text style={styles.personName} numberOfLines={1}>
        {name || "Неизвестный сотрудник"}
      </Text>
    </View>
  </View>
);

type TaskInfoPeopleProps = {
  authorName?: string | null;
  editorName?: string | null;
};

export const TaskInfoPeople = ({
  authorName,
  editorName,
}: TaskInfoPeopleProps) => (
  <View style={styles.peopleRow}>
    <TaskInfoPersonBadge label="Автор" name={authorName} />
    <TaskInfoPersonBadge label="Редактор" name={editorName} />
  </View>
);

type TaskInfoCommentProps = {
  comment?: string | null;
  emptyText?: string;
};

export const TaskInfoComment = ({
  comment,
  emptyText,
}: TaskInfoCommentProps) => {
  const text = comment || emptyText;

  if (!text) return null;

  return (
    <View style={styles.commentBox}>
      <Text style={styles.commentLabel}>Комментарий</Text>
      <Text style={styles.commentText}>{text}</Text>
    </View>
  );
};
