import { StyleSheet } from "react-native";

import Colors from "../../../../../shared/styles/Colors";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 24, 40, 0.42)",
  },
  sheet: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAECF0",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F6EC",
    marginRight: 10,
  },
  headerText: {
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
  },
  content: {
    maxHeight: 560,
  },
  contentInner: {
    padding: 18,
  },
  grid: {
    gap: 11,
  },
  inputLabel: {
    marginBottom: 6,
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
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#101828",
    paddingVertical: 0,
  },
  suffix: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
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
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
  },
  placeholder: {
    color: "#98A2B3",
    fontWeight: "600",
  },
  forceRow: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forceRowActive: {
    borderColor: Colors.greenColor,
    backgroundColor: "#F6FEF9",
  },
  forceText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  forceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#101828",
  },
  forceSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#667085",
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
  cancelButton: {
    backgroundColor: "#F2F4F7",
  },
  saveButton: {
    backgroundColor: Colors.greenColor,
  },
  disabledButton: {
    opacity: 0.65,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475467",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },
});
