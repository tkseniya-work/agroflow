import React from "react";

import {
  AppPickerModal,
  PickerOption,
} from "../../../AppSelector/AppPickerModal";
import { MachineryOption, TechniqueOption } from "./TaskTechniques.logic";

export type TaskTechniquePicker =
  | "technique"
  | "machinery"
  | "tariff"
  | "transferTariff";

type Props = {
  activePicker: TaskTechniquePicker | null;
  techniqueOptions: PickerOption<TechniqueOption>[];
  machineryOptions: PickerOption<MachineryOption>[];
  tariffOptions: PickerOption[];
  transferTariffOptions: PickerOption[];
  selectedTechnique: TechniqueOption | null;
  selectedMachinery: MachineryOption | null;
  selectedTariff: any | null;
  selectedTransferTariff: any | null;
  onClose: () => void;
  onSelectTechnique: (technique: TechniqueOption) => void;
  onSelectMachinery: (machinery: MachineryOption) => void;
  onSelectTariff: (tariff: any) => void;
  onSelectTransferTariff: (tariff: any) => void;
};

export function TaskTechniqueModalPickers({
  activePicker,
  techniqueOptions,
  machineryOptions,
  tariffOptions,
  transferTariffOptions,
  selectedTechnique,
  selectedMachinery,
  selectedTariff,
  selectedTransferTariff,
  onClose,
  onSelectTechnique,
  onSelectMachinery,
  onSelectTariff,
  onSelectTransferTariff,
}: Props) {
  return (
    <>
      <AppPickerModal
        visible={activePicker === "technique"}
        title="Выбор техники"
        data={techniqueOptions}
        selectedId={selectedTechnique?.id}
        emptyText="Нет доступной техники"
        onClose={onClose}
        onSelect={onSelectTechnique}
      />

      <AppPickerModal
        visible={activePicker === "machinery"}
        title="Выбор сельхозмашины"
        data={machineryOptions}
        selectedId={selectedMachinery?.id}
        emptyText="Нет доступных сельхозмашин"
        onClose={onClose}
        onSelect={onSelectMachinery}
      />

      <AppPickerModal
        visible={activePicker === "tariff"}
        title="Выбор тарифа"
        data={tariffOptions}
        selectedId={selectedTariff?.id || selectedTariff?.work_standard_tariff_id}
        emptyText="Нет доступных тарифов"
        onClose={onClose}
        onSelect={onSelectTariff}
      />

      <AppPickerModal
        visible={activePicker === "transferTariff"}
        title="Выбор тарифа на перегон"
        data={transferTariffOptions}
        selectedId={
          selectedTransferTariff?.id ||
          selectedTransferTariff?.work_standard_tariff_id
        }
        emptyText="Нет доступных тарифов на перегон"
        onClose={onClose}
        onSelect={onSelectTransferTariff}
      />
    </>
  );
}
