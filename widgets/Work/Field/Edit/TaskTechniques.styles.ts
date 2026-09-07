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
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
  },
  addButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.greenColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.greenColor,
  },
  emptyBox: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#667085",
  },
  techniqueList: {
    gap: 8,
  },
  techniqueRow: {
    minHeight: 66,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  techniqueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  techniqueTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  techniqueName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#101828",
  },
  techniqueMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
});
