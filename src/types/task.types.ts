import { MaterialCommunityIcons } from "@expo/vector-icons";

export type ShiftPartDetails = {
  type: "field" | "transfer";
  title: string;
  subtitle: string;
  shiftName?: string;
  shiftType?: number | null;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  deleteTitle: string;
  deleteMessage?: string;
  deleteIds: string[];
  rows: {
    label: string;
    value: string;
  }[];
  summary?: {
    label: string;
    value: string;
    accent?: boolean;
  }[];
  sections?: {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    rows?: {
      label: string;
      value: string;
      strong?: boolean;
    }[];
    metricGroups?: {
      title: string;
      rows: {
        label: string;
        value: string;
        strong?: boolean;
      }[];
    }[];
    items?: string[];
    materialGroups?: {
      title: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      emptyText: string;
      items?: {
        label: string;
        value: string;
      }[];
    }[];
  }[];
  materials?: string[];
  editContext?: {
    productionShiftId?: string | null;
    employeeId?: string | null;
    aggregate?: any;
    fieldGrouped?: any;
    tariffGrouped?: any;
    transferGrouped?: any;
  };
};

export type CombinedWorkBlockProps = {
  employee?: any;
  employeeName: string;
  employeePosition: string;
  groupedAggregate: any;
  productionShiftId?: string | null;
  shiftType?: number | null;
  shiftSettings?: any;
  qrCodeScannedAt?: any;
  onOpenDetails: (details: ShiftPartDetails) => void;
  onEditPart: (details: ShiftPartDetails) => void;
  onDeletePart: (details: ShiftPartDetails) => void;
  deletingPartId?: string | null;
};

export type FieldPartCardProps = {
  employeeName: string;
  employeePosition: string;
  aggregate: any;
  fieldPart: any;
  tariffPart: any;
  productionShiftId?: string | null;
  shiftType?: number | null;
  qrCodeScannedAt?: any;
  onOpenDetails: (details: ShiftPartDetails) => void;
  onEditPart: (details: ShiftPartDetails) => void;
  onDeletePart: (details: ShiftPartDetails) => void;
  deletingPartId?: string | null;
};

export type TransferPartCardProps = {
  employeeName: string;
  employeePosition: string;
  aggregate: any;
  currentPart: any;
  productionShiftId?: string | null;
  shiftType?: number | null;
  kilometers?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  qrCodeScannedAt?: any;
  onEditPart: (details: ShiftPartDetails) => void;
  onDeletePart: (details: ShiftPartDetails) => void;
  deletingPartId?: string | null;
};
