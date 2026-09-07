export interface EmployeeRequest {
  userId: string | null;
  accessToken: string | null;
}

export interface EmployeeListRequest {
  accessToken: string | null;
  companyUuid: string | null;
}

export interface CompanyRequest {
  companyUuid: string | null;
  accessToken: string | null;
}

export type EmployeeCompanyId = string;
export type EmployeeIsoDateTime = string;

export interface EmployeePositionDto {
  id: EmployeeCompanyId;
  name: string | null;
  description: string | null;
  id_1c: string | null;
}

export interface EmployeeDto {
  id: EmployeeCompanyId;
  email: string | null;
  status: string | null;
  firstname: string | null;
  surname: string | null;
  middlename: string | null;
  company_id: EmployeeCompanyId | null;
  user_id: EmployeeCompanyId | null;
  role: string | null;
  role_description: string | null;
  image_url: string | null;
  id_1c: string | null;
  hired_at: EmployeeIsoDateTime | null;
  birthday: EmployeeIsoDateTime | null;
  date_of_dismissal: EmployeeIsoDateTime | null;
  phone: string | null;
  position: EmployeePositionDto | null;

  erp_old_id?: string | null;
}

export interface CompanyRegionDto {
  code: string | null;
  name: string | null;
}

export interface CompanyIntegratorDto {
  integrator_user_id: EmployeeCompanyId | null;
  first_name: string | null;
  last_name: string | null;
}

export interface CompanyRelationDto {
  company_uuid: EmployeeCompanyId;
  company_id: string | null;
  name: string | null;
  legal_form: string | null;
  inn: string | null;
}

export interface CompanyDto {
  company_uuid: EmployeeCompanyId;
  company_id: string | null;
  timezone_offset: number | null;
  time_zone_id: string | null;
  name: string | null;
  legal_form: string | null;
  inn: string | null;
  ogrn: string | null;
  kpp: string | null;
  okvd: string | null;
  rs: string | null;
  ks: string | null;
  bk: string | null;
  phone_1: string | null;
  phone_2: string | null;
  phone_3: string | null;
  fax: string | null;
  address: string | null;
  location: string | null;
  fedstat_region: CompanyRegionDto | null;
  region: CompanyRegionDto | null;
  integrator: CompanyIntegratorDto | null;
  email: string | null;
  status: number | null;
  status_desc: string | null;
  parent_company: CompanyRelationDto | null;
  child_companies: CompanyRelationDto[];
}

export interface UploadPictureRequest {
  userId: string;
  accessToken: string;
  fileUri: string;
  fileName: string;
  mimeType: string;
}
