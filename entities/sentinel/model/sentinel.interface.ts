export interface WMSRequest {
  accessToken: string | null;
  instanceId: string;
  sessionId: string;
}

export interface FieldImageDatesRequest {
  accessToken: string | null;
  season: number;
  from: string;
  to: string;
}

export interface FieldCatalogRequest {
  accessToken: string | null;
  sessionFieldId: string;
  fieldId: string;
  from: string;
  to: string;
}

export interface FieldNDVIRequest {
  accessToken: string | null;
  sessionFieldId: string;
  fieldId: string;
  from: string;
  to: string;
}

export interface SeasonFieldNdviRequest {
  accessToken: string | null;
  sessionFieldId: string;
  from: string;
  to: string;
}

export interface SessionLoginResponse {
  session_id: string;
}

export interface FieldImageDatesResponse {
  image_dates: string[];
}

export interface SeasonFieldNdviResponse {
  image_date: string;
  min: number;
  max: number;
  avg: number;
  cloud_coverage: number;
}
