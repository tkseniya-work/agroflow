// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_employees.sql';
import m0001 from './0001_dictionaries.sql';
import m0002 from './0002_time.sql';
import m0003 from './0003_unitOfMeasure.sql';
import m0004 from './0004_productionShifts.sql';
import m0005 from './0005_openProductionShifts.sql';
import m0006 from './0006_companies.sql';
import m0007 from './0007_ProductionPlan2.sql';
import m0008 from './0008_techniqueStandardsMonitoring.sql';
import m0009 from './0009_productionShiftPart.sql';
import m0010 from './0010_processedShiftData.sql';
import m0011 from './0011_tariffList.sql';
import m0012 from './0012_add_base_tariff_price.sql';
import m0013 from './0013_openProductionShift_segment_meta.sql';
import m0014 from './0014_openProductionShift_sync_state.sql';
import m0015 from './0015_dictionary_unique_indexes.sql';
import m0016 from './0016_add_shift_break_settings.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006,
m0007,
m0008,
m0009,
m0010,
m0011,
m0012,
m0013,
m0014,
m0015,
m0016
    }
  }
