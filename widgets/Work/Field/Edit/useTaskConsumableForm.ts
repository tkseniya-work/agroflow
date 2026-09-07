import { useCallback, useState } from "react";

import type { ProductionTaskConsumableType } from "../../../../entities/productionTask";
import {
  buildConsumablePayload,
  type ConsumablePayload,
  getInitialUnit,
} from "./TaskConsumables.logic";

type Args = {
  selectedField: any | null;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
  onSaveNorm: (
    type: ProductionTaskConsumableType,
    data: ConsumablePayload,
  ) => Promise<boolean>;
};

export function useTaskConsumableForm({
  selectedField,
  showWarning,
  showError,
  onSaveNorm,
}: Args) {
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isSourceVisible, setIsSourceVisible] = useState(false);
  const [isUnitVisible, setIsUnitVisible] = useState(false);
  const [editingType, setEditingType] =
    useState<ProductionTaskConsumableType>("seed");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showEditAfterPicker = useCallback(() => {
    setTimeout(() => {
      setIsEditVisible(true);
    }, 0);
  }, []);

  const openEdit = useCallback(
    (
      type: ProductionTaskConsumableType,
      item: any | null = null,
    ) => {
      setEditingType(type);
      setEditingItem(item);
      setSelectedSource(null);
      setSelectedUnit(getInitialUnit(item));
      setQuantity(String(item?.quantity ?? item?.norm_value ?? ""));
      setIsEditVisible(true);
    },
    [],
  );

  const closeEdit = useCallback(() => {
    setIsEditVisible(false);
    setEditingItem(null);
    setSelectedSource(null);
    setSelectedUnit(null);
    setQuantity("");
  }, []);

  const openSource = useCallback(() => {
    setIsEditVisible(false);
    setTimeout(() => {
      setIsSourceVisible(true);
    }, 0);
  }, []);

  const closeSource = useCallback(() => {
    setIsSourceVisible(false);
    showEditAfterPicker();
  }, [showEditAfterPicker]);

  const selectSource = useCallback(
    (item: any) => {
      setSelectedSource(item);
      setQuantity(String(item?.quantity ?? item?.norm_value ?? ""));
      setIsSourceVisible(false);
      showEditAfterPicker();
    },
    [showEditAfterPicker],
  );

  const openUnit = useCallback(() => {
    setIsEditVisible(false);
    setTimeout(() => {
      setIsUnitVisible(true);
    }, 0);
  }, []);

  const closeUnit = useCallback(() => {
    setIsUnitVisible(false);
    showEditAfterPicker();
  }, [showEditAfterPicker]);

  const selectUnit = useCallback(
    (item: any) => {
      setSelectedUnit(item);
      setIsUnitVisible(false);
      showEditAfterPicker();
    },
    [showEditAfterPicker],
  );

  const save = useCallback(async () => {
    if (!selectedField) return;

    const result = buildConsumablePayload({
      fieldId: selectedField.id,
      type: editingType,
      editingItem,
      selectedSource,
      selectedUnit,
      quantity,
    });

    if (result.error) {
      showWarning(result.error);
      return;
    }

    try {
      setIsSubmitting(true);

      const success = await onSaveNorm(editingType, result.payload);

      if (success) {
        closeEdit();
      } else {
        showError("Не удалось сохранить расходник");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    closeEdit,
    editingItem,
    editingType,
    onSaveNorm,
    quantity,
    selectedField,
    selectedSource,
    selectedUnit,
    showError,
    showWarning,
  ]);

  return {
    isEditVisible,
    isSourceVisible,
    isUnitVisible,
    editingType,
    editingItem,
    selectedSource,
    selectedUnit,
    quantity,
    isSubmitting,
    openEdit,
    closeEdit,
    openSource,
    closeSource,
    selectSource,
    openUnit,
    closeUnit,
    selectUnit,
    changeQuantity: setQuantity,
    save,
  };
}
