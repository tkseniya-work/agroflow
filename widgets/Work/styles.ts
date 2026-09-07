import { StyleSheet } from "react-native";
import Colors from "../../shared/styles/Colors";

export const styles = StyleSheet.create({
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 2,
  },

  taskControls: {
    height: 56,
    position: "relative",
  },

  taskFilterRow: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-start",
  },

  taskSearchChip: {
    height: 36,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 999,
    backgroundColor: Colors.white,
  },

  taskSearchChipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.grey700,
  },

  taskSearch: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 40,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 999,
    backgroundColor: Colors.white,
  },

  taskSearchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.grey800,
  },

  taskSearchAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  taskChipsWrapper: {
    flex: 1,
    height: 40,
    maxHeight: 40,
  },

  taskChips: {
    paddingRight: 14,
    gap: 8,
    height: 36,
    alignItems: "center",
  },

  taskChip: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },

  taskChipActive: {
    backgroundColor: "#E8F5E9",
  },

  taskChipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.grey700,
  },

  taskChipTextActive: {
    color: Colors.greenColor,
  },

  listContent: {
    paddingBottom: 120,
    gap: 12,
  },

  tasksList: {
    flex: 1,
  },

  tasksFooterLoader: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyListContent: {
    flexGrow: 1,
  },

  taskCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.white,
    borderColor: Colors.grey300,
    borderWidth: 1,
    elevation: 2,
    shadowColor: Colors.grey400,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  taskCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  taskInfo: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: Colors.grey800,
  },

  taskSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.grey600,
  },

  taskTypeText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: Colors.greenColor,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#E8F5E9",
  },

  statusBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    color: Colors.greenColor,
  },

  statusBadgeCompleted: {
    backgroundColor: "#F3F4F6",
  },

  statusBadgeCompletedText: {
    color: "#667085",
  },

  progressSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.grey700,
  },

  progressValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.greenColor,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#EEF2F6",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  progressInfoRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressInfoText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: Colors.grey600,
  },

  taskDetails: {
    marginTop: 14,
    gap: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  detailLabel: {
    width: 96,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey600,
  },

  detailValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.grey800,
  },

  tasksEmptyState: {
    flex: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  tasksEmptyTitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: Colors.grey800,
  },

  fabButton: {
    position: "absolute",
    right: 20,
    bottom: 108,
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 9999,
  },

  backdrop: {
    backgroundColor: Colors.black + "80",
  },

  taskTypeModal: {
    width: 330,
    maxWidth: "92%",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    backgroundColor: Colors.white,
  },

  taskTypeModalHeader: {
    gap: 4,
  },

  taskTypeModalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: Colors.grey800,
  },

  taskTypeModalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.grey600,
  },

  taskTypeOptions: {
    gap: 8,
  },

  taskTypeOption: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey300,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
  },

  taskTypeOptionPressed: {
    backgroundColor: "#E8F5E9",
  },

  taskTypeOptionSelected: {
    borderColor: Colors.greenColor,
    backgroundColor: "#E8F5E9",
  },

  taskTypeOptionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: Colors.grey800,
  },

  taskTypeOptionTitleSelected: {
    color: Colors.greenColor,
  },

  taskTypeCancelButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },

  taskTypeCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.grey600,
  },

  zonesInlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  zonesInlineText: {
    flexShrink: 0,
    marginRight: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.grey800,
  },

  zonesModal: {
    width: 300,
    maxHeight: 420,
    borderRadius: 20,
    backgroundColor: Colors.white,
    padding: 14,
  },

  zonesModalList: {
    maxHeight: 340,
  },

  zonesModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  zonesModalTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: Colors.grey800,
  },

  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F3",
  },

  zoneIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    backgroundColor: "#E8F5E9",
    color: Colors.greenColor,
    fontSize: 12,
    fontWeight: "700",
  },

  zoneName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    color: Colors.grey800,
  },

  costValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  costValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey800,
  },

  costValueLarge: {
    color: Colors.error,
  },

  costUnit: {
    marginLeft: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: Colors.grey600,
  },

  costMuted: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.grey800,
  },

  costPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  costsModal: {
    width: 280,
    borderRadius: 20,
    backgroundColor: Colors.white,
    padding: 14,
  },

  costsModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  costsModalTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: Colors.grey800,
  },

  costsModalContent: {
    gap: 8,
  },

  costsModalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  costsModalLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.grey600,
  },

  costsModalValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.grey800,
  },

  swipeActions: {
    width: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingLeft: 10,
    marginBottom: 12,
  },

  swipeCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 6,
  },

  swipeCircleEdit: {
    backgroundColor: "#22C55E",
  },

  swipeCircleDelete: {
    backgroundColor: "#EF4444",
  },
});

export const addEditStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.grey800,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.grey500,
    marginTop: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingBottom: 12,
  },
  inputBox: {
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.grey500,
    marginBottom: 4,
  },
  textInput: {
    minHeight: 30,
    padding: 0,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },
  commentInput: {
    minHeight: 90,
    paddingTop: 6,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.greenColor,
  },
  submitButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenColor,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },

  pickerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pickerCard: {
    width: "90%",
    maxHeight: "65%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 8,
  },
  pickerHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.grey800,
  },
  pickerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerListContent: {
    paddingBottom: 8,
  },
  pickerItem: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F7F8FA",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerItemActive: {
    backgroundColor: Colors.greenColorLight,
    borderWidth: 1,
    borderColor: Colors.greenColor,
  },
  pickerItemTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.grey800,
  },
  pickerItemTitleActive: {
    color: Colors.greenColor,
  },
  pickerItemSubtitle: {
    fontSize: 12,
    color: Colors.grey500,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grey500,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});
