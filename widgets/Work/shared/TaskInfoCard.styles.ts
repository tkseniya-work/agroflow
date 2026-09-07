import { StyleSheet } from "react-native";

import Colors from "../../../shared/styles/Colors";

export const taskInfoCardStyles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    gap: 14,
  },
  loadingCard: {
    minHeight: 108,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#667085",
  },
  emptyState: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.error,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#667085",
  },
  statusBadge: {
    maxWidth: 112,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoItem: {
    width: "48%",
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoItemFull: {
    width: "100%",
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: "#667085",
  },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  progressBlock: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 12,
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.greenColor,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EAECF0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.greenColor,
  },
  peopleRow: {
    gap: 8,
  },
  personBadge: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.white,
  },
  personTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  personLabel: {
    fontSize: 11,
    color: "#667085",
  },
  personName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#101828",
  },
  commentBox: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  commentLabel: {
    fontSize: 12,
    color: "#667085",
  },
  commentText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#101828",
  },
});
