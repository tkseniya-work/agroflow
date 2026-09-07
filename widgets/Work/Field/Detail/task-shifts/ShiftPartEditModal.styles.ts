import { StyleSheet } from "react-native";

import Colors from "../../../../../shared/styles/Colors";

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 24, 40, 0.42)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAECF0",
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  titleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
    marginLeft: 10,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  tabActive: {
    backgroundColor: "#E7F6EC",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#667085",
  },
  tabTextActive: {
    color: Colors.greenColor,
  },
  content: {
    maxHeight: 520,
  },
  contentInner: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  formGrid: {
    gap: 10,
  },
  inputWrap: {
    gap: 6,
  },
  selector: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  selectorValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  placeholder: {
    color: "#98A2B3",
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
  },
  inputBox: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputBoxError: {
    borderColor: Colors.error,
    backgroundColor: "#FEF3F2",
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#101828",
    paddingVertical: 0,
  },
  inputSuffix: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
  },
  inputErrorText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: Colors.error,
  },
  infoBox: {
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    padding: 12,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#475467",
  },
  materialList: {
    gap: 8,
    marginBottom: 10,
  },
  materialItem: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  materialItemActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#F6FEF9",
  },
  materialTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  materialSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
  },
  emptyBox: {
    minHeight: 120,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
  },
  emptyText: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EAECF0",
  },
  footerButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: "#F2F4F7",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475467",
  },
  saveButton: {
    backgroundColor: Colors.greenColor,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
});
