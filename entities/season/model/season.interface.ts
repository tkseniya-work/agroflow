export interface SeasonFieldsRequest {
    accessToken: string | null;
    season: string;
    workKind?: number | string | null;
}

export interface SeasonFieldHarvestInfoRequest {
    accessToken: string | null;
    seasonFieldId: string;
}

export interface SeasonFieldGrowStageEvaluationRequest {
    accessToken: string | null;
    seasonFieldId: string;
}

export interface SeasonFieldYieldForecastRequest {
    accessToken: string | null;
    seasonFieldId: string;
}

export interface SeasonFieldHarvestInfoResponse {
    harvest_date: string | null;
    season_field_id: string;
    season_field_name: string | null;
    season_field_area: number;
    yield: number;
    fact_area: number;
    threshed: number;
    number_of_bins: number;
}

export interface SeasonRequest {
  id: string;
  year: number;
  is_current: boolean;
}

type Coordinates = {
    type: "Polygon";
    coordinates: number[][][]; // [ring][point][lon, lat]
};

export interface Event {
    crop: Crop;
    crop_variety: CropVariety;
    event_type: {
        id: number;
        description: string;
    };
    date: string;
    grow_stage: GrowStage | null;
}

interface Crop {
    id: string;
    name: string;
    id_1c: string | null;
    color: string;
    crop_group?: number;
    cultivation_type?: number;
}

interface CropVariety {
    id: string;
    name: string;
    external_crop_variety_id: string;
    code: number;
    threshold_temperature: number;
    producer: string;
    url: string;
    source: string;
    crop_external_id: string;
}

interface GrowStage {
    id: string;
    name: string;
    description: string;
    serial_number: number;
    external_id: string;
    image_link: string | null;
    active_temperature_condition: number;
    crop_standard_id: string;
}

interface Evaluation {
    next_stage: {
        number: number;
        name: string;
        days_forecast_min: number;
        days_forecast_max: number;
        date_min: string;
        date_max: string;
        justification: string;
    };
    current_stage: {
        number: number;
        name: string;
        justification: string;
    };
}

export interface YieldForecast {
    id: string;
    season_field_id: string;
    forecast_date: string;
    harvest: number;
    harvest_date: string;
    quality_parameters: {
        name: string;
        value: number;
        UnitName: string;
    }[];
    description: string;
}

interface AdditionalInfo {
    id: string;
    season_field_id: string;
    beams: number;
    solonets: number;
    productive_moisture_in_meter_soil_layer: number;
    humus: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    seed_germination: number;
}

interface CropRotation {
    clean_fallow: boolean;
    crop: Crop | null;
}

// --- Основная модель ---

export interface SeasonFieldRequest {
    id: string;
    company_id: string;
    id_1c: string | null;
    number: string;
    name: string;
    area: number
    map_area: number;
    srid: number;   // Система координат (4326 = WGS84)
    ground_type: number;
    coordinates: Coordinates;
    origin_field_id: string;
    crop_rotation: CropRotation;
    production_plan_id: string | null;
    year: number;
    events: Event[];
    evaluation: Evaluation | null;
    yield_forecast: YieldForecast | null;
    additional_info: AdditionalInfo | null;
}
