export type ForcedCloseMode = "offline" | "online";

export type ForcedCloseDateTimeValue = {
  date: string;
  time: string;
};

export type ForcedCloseShiftModalProps = {
  visible: boolean;
  shifts: any[];
  mode?: ForcedCloseMode;
  needsTime: boolean;
  pickerVisible: boolean;
  queueIndex: number;
  queueTotal: number;
  closeDate: string;
  closeTime: string;
  selectedCloseDate: Date | null;
  isClosing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onTogglePicker: () => void;
  onDateTimeChange: (value: ForcedCloseDateTimeValue) => void;
};
