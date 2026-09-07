import {
  Technique,
  TechniqueTrackResponse,
  TrackItem,
} from "../../entities/techniqueMonitoring";
import {
  SeasonFieldRequest,
  SeasonRequest,
} from "../../entities/season";
import { ProductionTask } from "../../entities/productionTask";
import {
  SeasonFieldNdviResponse,
} from "../../entities/sentinel";

// The original app fetched this from `entities/productionPlan`, which this
// trimmed sample removes. Only the fields the map UI actually reads are
// kept here so `FieldInfo`'s economics/yield display still type-checks.
export interface ProductionPlanResponse {
  planning_yield?: number | null;
  analytic?: {
    economics?: {
      marginal_profitability?: number | null;
      profitability?: number | null;
    };
  };
}

export type TechniqueTrackSummary = Omit<TechniqueTrackResponse, "technique"> & {
  technique: Pick<TechniqueTrackResponse["technique"], "id" | "name"> &
    Partial<TechniqueTrackResponse["technique"]>;
};

export type MapViewMode = "standard" | "ndvi" | "offline";

export type MeasurementMode = "area" | "distance";

export type MapInteractionMode = "none" | "selectRegion";

export type StandardView = "fields" | "tasks" | "machines";

export type FieldDisplayMode = "default" | "taskView" | "stationaryZone";

export type Coordinate = [number, number];

export interface MapboxOfflineMapProps {
  companyLocation?: Coordinate;

  hasLocationPermission: boolean;
  showUserLocation?: boolean;
  userLocation?: [number, number] | null;

  pinStartLocation?: [number, number] | null;
  pinEndLocation?: [number, number] | null;

  showTechniqueLabels: boolean;

  technique?: Technique[];
  draftPeriod?: Period | null;

  tracks?: TrackItem[];

  fields?: SeasonFieldRequest[];
  selectedField: SeasonFieldRequest | null;
  selectedFieldIds?: string[];
  fitToSelectedFields?: boolean;
  fitToTracks?: boolean;
  fitToSelectedFieldsPadding?: number;
  fieldDisplayMode?: FieldDisplayMode;

  viewMode?: MapViewMode;
  interactionMode?: MapInteractionMode;

  initZoom?: number;
  captureGestures?: boolean;

  isMeasurementActive?: boolean;
  measurementMode?: MeasurementMode;
  measurementPoints?: Coordinate[];
  onAddMeasurementPoint?: (coordinate: Coordinate) => void;
  onMoveMeasurementPoint?: (index: number, coordinate: Coordinate) => void;

  setInteractionMode?: (mode: MapInteractionMode) => void;

  seasons?: SeasonRequest[];
  selectedSeason?: SeasonRequest | null;

  onSelectSeason?: (
    season: SeasonRequest,
  ) => void | Promise<void>;

  onPressCompany?: () => void;

  onSelectedFieldChange: (
    field: SeasonFieldRequest | null,
  ) => void | Promise<void>;

  selectedDate?: string | null;
  sessionId?: string | null;

  onRefreshSession?: () => Promise<
    string | null | undefined
  >;

  onNdviLoadingChange?: (loading: boolean) => void;

  cameraRef?: any;
  currentLocationRef?: any;

  onRegionSaved?: (
    bounds: [[number, number], [number, number]],
  ) => Promise<void>;

  loadTechnique?: (
    options?: { silent?: boolean },
  ) => void | Promise<void>;

  onChangeDraftPeriod?: (period: Period) => void;
}

export interface SearchableDropdownProps {
  data: DropdownItem[];
  selectedTechnique?: DropdownItem[] | null;
  placeholder?: string;
  onSelect: (item: DropdownItem) => void;
  onDropdownStateChange?: (isOpen: boolean) => void;
  onSelectedTechniqueChange: (technique: DropdownItem) => void;
  onResetSelectedTechnique: () => void;
}

export interface TrackingTabProps {
  technique?: Technique[];
  cameraRef: any;
  selectedTechnique?: DropdownItem[] | null;
  draftPeriod: Period | null;
  trackSummary?: TechniqueTrackSummary[] | null;

  view: StandardView;
  setView: (view: StandardView) => void;

  seasons: SeasonRequest[];
  selectedSeason: SeasonRequest | null;
  selectedField: SeasonFieldRequest | null;
  onSeasonChange: (season: SeasonRequest) => void | Promise<void>;

  productionTasks: ProductionTask[];

  productionPlan: ProductionPlanResponse | null;

  onSelectedTechniqueChange: (techniques: DropdownItem[]) => void;
  onResetSelectedTechnique: () => void;
  onChangeDraftPeriod: (period: Period | null) => void;
  onCreateTechniqueTracks: (period?: Period) => void;
  clearTrack: () => void;

  onShowTaskTrack: (task: ProductionTask) => Promise<boolean>;
  onHideTaskTrack: () => void;

  collapsePanel: () => void;
}

export interface NdviPanelProps {
  dates: string[];
  selectedDate: string | null;
  seasons?: SeasonRequest[];
  selectedSeason?: SeasonRequest | null;
  sessionId?: string | null;
  selectedField?: SeasonFieldRequest | null;
  currentSeasonFieldNdvi?: SeasonFieldNdviResponse[];
  onSelectImageDate?: (date: string) => void | Promise<void>;
  onSelectField: (field: SeasonFieldRequest | null) => void;
  onSeasonChange?: (season: SeasonRequest) => void | Promise<void>;
  collapsePanel?: () => void;
}

export interface OfflineTabProps {
  companyInfo?: any;
  regions: OfflineRegion[];
  downloadStates?: Record<string, OfflineRegionDownloadState>;
  cameraRef: any;
  setInteractionMode: (mode: MapInteractionMode) => void;
  collapsePanel: () => void;
  loadRegions: () => Promise<void>;
  saveRegion: (bounds: [[number, number], [number, number]]) => Promise<void>;
  deleteRegion: (id: string) => Promise<void>;
}

export type OfflineRegionDownloadState = {
  status: "downloading" | "complete" | "error";
  percentage: number;
  completedResourceSize: number;
  error?: string;
};

export interface MapBottomPanelProps {
  viewMode: MapViewMode;
  setViewMode: (mode: MapViewMode) => void;

  interactionMode: MapInteractionMode;
  setInteractionMode: (mode: MapInteractionMode) => void;

  companyInfo?: any;
  regions: OfflineRegion[];
  downloadStates?: Record<string, OfflineRegionDownloadState>;
  cameraRef: any;

  technique?: Technique[];
  draftPeriod: Period | null;
  selectedTechnique?: DropdownItem[] | null;
  trackSummary?: TechniqueTrackSummary[] | null;

  seasons: SeasonRequest[];
  selectedSeason: SeasonRequest | null;
  selectedField: SeasonFieldRequest | null;
  onSeasonChange: (season: SeasonRequest) => void | Promise<void>;

  productionTasks: ProductionTask[];

  productionPlan: ProductionPlanResponse | null;

  fieldImageDates: string[];
  selectedDate: string | null;
  sessionId?: string | null;
  currentSeasonFieldNdvi?: SeasonFieldNdviResponse[];
  onSelectImageDate: (date: string | null) => void;

  loadRegions: () => Promise<void>;
  saveRegion: (bounds: [[number, number], [number, number]]) => Promise<void>;
  deleteRegion: (id: string) => Promise<void>;

  onChangeDraftPeriod: (period: Period | null) => void;
  onSelectedTechniqueChange: (technique: DropdownItem[]) => void;
  onResetSelectedTechnique: () => void;
  onCreateTechniqueTracks: (period?: Period) => void;
  clearTrack: () => void;

  onShowTaskTrack: (task: ProductionTask) => Promise<boolean>;
  onHideTaskTrack: () => void;

  onChangeSheet: (index: number) => void;
  onSelectField: (field: SeasonFieldRequest | null) => void;
}

export interface PeriodSelectorProps {
  draftPeriod: Period | null;
  isTrackActionDisabled?: boolean;
  onChangeDraftPeriod: (period: Period | null) => void;
  onCreateTechniqueTracks: (period?: Period) => void;
  clearTrack: () => void;
  collapsePanel: () => void;
}

export interface DropdownItem {
  id: string;
  name: string;
  coordinates?: [number, number];
  [key: string]: any;
  isSelected?: boolean;
}

export interface OfflineRegion {
  id: string;
  name: string;
  bounds: [[number, number], [number, number]];
  minZoom: number;
  maxZoom: number;
  styleURL: string;
  metadata?: {
    name?: string;
    fullAddress?: string;
    actualCenter?: [number, number];
    actualZoom?: number;
    address?: string;
    downloadedAt?: string;
    completedResourceSize?: number;
  };
  isDeletable: boolean;
}

export interface SeasonFieldsProps {
  fields: SeasonFieldRequest[] | undefined;
  visible?: boolean;
  isNdviMode: boolean;
  selectedField: SeasonFieldRequest | null;
  selectedFieldIds?: string[];
  displayMode?: FieldDisplayMode;
  isInteractionDisabled?: boolean;
  onPressField?: (field: SeasonFieldRequest) => void;
}

export interface TechniqueTrackPagerProps {
  trackSummary: TechniqueTrackSummary[];
  nativeGestureRef: any;
}

export interface Period {
  startDate?: Date;
  endDate?: Date;
}

export type TaskCardListProps = {
  tasks: any[];
  onShowTrack?: (task: any) => Promise<boolean | void> | boolean | void;
  onHideTrack?: (task: any) => Promise<void> | void;
};

export type MapFloatingControlsProps = {
  onPressCompany?: () => void;
  onPressMyLocation?: () => void;
};
