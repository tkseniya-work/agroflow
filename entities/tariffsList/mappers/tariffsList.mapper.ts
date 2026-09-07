import type { TariffsList } from "../../dictionaries/model/dictionary.interface";

export const mapTariffListToDb = (item: TariffsList) => ({
  id: item.id,

  work_standard_tariff_id: item.id,

  work_standard_id: item.work_standard_id,

  tariff_type: item.tariff_type,
  tariff_discriminator: item.tariff_discriminator,

  overtime_ratio: item.overtime_ratio,
  workload_type: item.workload_type,

  comment: item.comment,

  technique_model_id: item.technique_model_id,
  agricultural_machinery_model_id: item.agricultural_machinery_model_id,

  unit_code: item.unit_code,

  norm_value: item.norm_value,
  norm_value_ha: item.norm_value_ha,

  norm_fuel_value_per_hour: item.norm_fuel_value_per_hour,
  norm_fuel_value_per_unit: item.norm_fuel_value_per_unit,
  norm_fuel_per_ha: item.norm_fuel_per_ha,

  tariff_ranked_parameters: item.tariff_ranked_parameters,
  tariff_price_parameters: item.tariff_price_parameters,

  is_deleted: item.is_deleted,
  deleted_at: item.deleted_at,
});
