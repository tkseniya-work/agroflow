import React, { memo } from "react";

import type { ProductionTaskField } from "../../../../entities/productionTask";
import { AppPickerModal } from "../../../AppSelector/AppPickerModal";
import { ConsumableEditModal } from "./ConsumableEditModal";
import type { ConsumableOption } from "./TaskConsumables.logic";
import type { TaskConsumablesScreenModel } from "./useTaskConsumablesScreen";

type Props = {
  isFieldPickerVisible: boolean;
  selectedField: ProductionTaskField | null;
  fieldOptions: ConsumableOption[];
  sourceOptions: ConsumableOption[];
  unitOptions: ConsumableOption[];
  form: TaskConsumablesScreenModel["form"];
  onCloseFieldPicker: () => void;
  onSelectField: (field: ProductionTaskField) => void;
};

const TaskConsumablesModalsComponent = ({
  isFieldPickerVisible,
  selectedField,
  fieldOptions,
  sourceOptions,
  unitOptions,
  form,
  onCloseFieldPicker,
  onSelectField,
}: Props) => (
  <>
    <AppPickerModal
      visible={isFieldPickerVisible}
      title="Выбор поля"
      data={fieldOptions}
      selectedId={selectedField?.id}
      onClose={onCloseFieldPicker}
      onSelect={onSelectField}
    />

    <ConsumableEditModal
      visible={form.isEditVisible}
      type={form.editingType}
      editingItem={form.editingItem}
      selectedSource={form.selectedSource}
      selectedUnit={form.selectedUnit}
      sourceOptionsCount={sourceOptions.length}
      quantity={form.quantity}
      isSubmitting={form.isSubmitting}
      onQuantityChange={form.changeQuantity}
      onOpenSource={form.openSource}
      onOpenUnit={form.openUnit}
      onClose={form.closeEdit}
      onSubmit={form.save}
    />

    <AppPickerModal
      visible={form.isSourceVisible}
      title="Выбор расходника"
      data={sourceOptions}
      selectedId={form.selectedSource?.id}
      emptyText="Нет расходников этого типа"
      onClose={form.closeSource}
      onSelect={form.selectSource}
    />

    <AppPickerModal
      visible={form.isUnitVisible}
      title="Выбор единицы измерения"
      data={unitOptions}
      selectedId={form.selectedUnit?.type ?? form.selectedUnit?.id}
      emptyText="Нет единиц измерения"
      onClose={form.closeUnit}
      onSelect={form.selectUnit}
    />
  </>
);

export const TaskConsumablesModals = memo(TaskConsumablesModalsComponent);
