export interface TechniqueMonitoringRequest {
  accessToken: string | null;
  techniqueId: string;
  from: string;
  to: string;
}

export interface ProductionTaskTrackRequest {
  accessToken: string | null;
  taskId: string;
}

export interface TechniqueMonitoringMapping {
  id: string;
  name: string;
  state_number: string;
  external_monitoring_id: string;
  monitoring_provider_type: number;
  has_monitoring: boolean;
}

export enum FuelType {
  Unknown = 0,
  Petrol = 1,
  Diesel = 2,
  Gas = 3,
  Electric = 4,
  Hybrid = 5,
}

export enum MachineryType {
  Unknown = 0,
  Tractor = 1,
  Combine = 2,
  Truck = 3,
}

type TrackType = 1 | 2 | 3 | 4 | 5;

type Coordinate = [number, number];

export interface TrackItem {
  type: TrackType;
  c: Coordinate[]; // Массив координат
}

interface MachineryModel {
  id: string;
  name: string;
  power: number;
  fuel_consumption: number;
  external_id: string;
  source: string;
  fuel_type: FuelType;
  fuel_consumption_per_distance: number;
  load_capacity: number;
  type: MachineryType;
}

interface TechniqueStandard {
  id: string;
  name: string;
  company_id: string;
  state_number: string;
  id_1c: string;
  wianlon_id: string;
  autograph_id: string;
  has_monitoring: boolean;
  fuel_tank_capacity: number;
  engine_power: number;
  purchase_price: number;
  residual_value: number;
  photo_link: string;
  icon_link: string;
  track_color: string;
  machinery_model: MachineryModel;
}

export interface Technique {
  technique_standard: TechniqueStandard;
  last_position: [number, number];
}

export interface TechniqueTrackResponse {
  technique: TechniqueStandard;
  track: TrackItem[];
  track_length_km: number;
  small_stops_duration: string;
  long_stops_duration: string;
  fuel_consumed: number;
  avg_speed: number;
  max_speed: number;
  hasTrack: boolean
}

export interface ProductionTaskTrack {
  production_task_id: string;
  tracks: Track[];
}

export interface Track {
  task_technique_id: string;
  technique: Technique;
  agriculture_machine: MachineryModel;
  production_km: number;
  turns_km: number;
  transfer_km: number;
  total_km: number;
  stop_duration: string;
  stop_count: number;
  lines: TrackItem[];
}
