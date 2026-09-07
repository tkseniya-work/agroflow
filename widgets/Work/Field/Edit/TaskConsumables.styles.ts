import { StyleSheet } from "react-native";

import Colors from "../../../../shared/styles/Colors";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitleWrap: {
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
    fontSize: 12,
    color: "#667085",
  },
  countChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  countChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },
  fieldSelector: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EAECF0",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldSelectorContent: {
    flex: 1,
  },
  fieldSelectorLabel: {
    fontSize: 11,
    color: "#667085",
  },
  fieldSelectorValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#F2F4F7",
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#667085",
  },
  tabTextActive: {
    color: Colors.greenColor,
  },
  addButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addChip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.greenColor,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.greenColor,
  },
  addChipDisabled: {
    opacity: 0.45,
  },
  loadingNotice: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#087443",
  },
  list: {
    gap: 8,
  },
  emptyBox: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
  },
});
