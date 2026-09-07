import { JSX } from "react";
import { ShiftData } from "../../entities/productionShift";

export type TabType = "Текущие задачи" | "Архив";
export type ShiftGroups = Record<string, ShiftData[]>;

export interface ProcessedShiftData {
  data: ShiftData[];
  grouped: ShiftGroups;
  keys: string[];
}

export interface ArchiveTabProps {
  isLoading: boolean;
  isConnected: boolean;
  hasArchiveData: boolean;
  grouped: Record<string, ShiftData[]>;
  keys: string[];
  renderShiftGroups: (
    data: Record<string, ShiftData[]>,
    keys: string[],
    emptyMessage: string,
    isCurrentTab?: boolean
  ) => JSX.Element;
}
