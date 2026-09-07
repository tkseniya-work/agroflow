import type { ProductionTask } from "../../../entities/productionTask";

export type ProductionTaskFormSubmitResult = boolean | void;

export type ProductionTaskFormSubmit = (
  data: any,
) =>
  | ProductionTaskFormSubmitResult
  | Promise<ProductionTaskFormSubmitResult>;

export type ProductionTaskFormModalBaseProps = {
  visible: boolean;
  currentTask?: ProductionTask | null;
  subtitle: string;
  requireWorkStandardOnCreate: boolean;
  keepOpenOnFalse: boolean;
  onClose: () => void;
  onSubmit: ProductionTaskFormSubmit;
  isSubmitting?: boolean;
};
