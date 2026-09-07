import { StyleSheet } from "react-native";

import Colors from "../../../../shared/styles/Colors";

export const taskSelectedFieldItemStyles = StyleSheet.create({
  fieldCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  fieldCardExpanded: {
    borderColor: "#ABEFC6",
  },
  fieldSummary: {
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FCFCFD",
  },
  fieldTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  fieldName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#101828",
  },
  fieldMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWorksBox: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  emptyWorksText: {
    fontSize: 13,
    color: "#667085",
  },
  worksList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  workRow: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
  },
  workRowSelected: {
    borderColor: Colors.greenColor,
    backgroundColor: "#ECFDF3",
  },
  workRowDisabled: {
    opacity: 0.62,
    backgroundColor: "#F2F4F7",
  },
  workRowUpdating: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    borderColor: Colors.greenColor,
    backgroundColor: Colors.greenColor,
  },
  checkboxUsed: {
    borderColor: "#98A2B3",
    backgroundColor: "#98A2B3",
  },
  workTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  workName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  workMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  selectedBadge: {
    borderRadius: 12,
    backgroundColor: Colors.greenColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.white,
  },
  usedBadge: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  usedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
  },
});
