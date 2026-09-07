const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const getTaskFieldId = (field: any) =>
  String(field?.season_field?.id ?? field?.id ?? "");

export const getTaskFieldWorkId = (work: any) =>
  String(work?.id ?? "");

export const isTaskFieldWorkUsed = (work: any) => {
  const value = work?.is_used ?? work?.isUsed;
  return value === true || value === 1 || value === "true" || value === "1";
};

export const normalizeTaskFieldWorks = (works: any): any[] => {
  if (!works) return [];
  if (!Array.isArray(works)) return [works];

  return works.flatMap((item) => {
    if (Array.isArray(item?.works)) {
      return item.works.map((work: any) => ({
        ...work,
        is_used: work?.is_used ?? item?.is_used ?? item?.isUsed,
      }));
    }

    return item;
  });
};

export const getTaskFieldWorkDateLabel = (work: any) =>
  [months[(work?.month ?? 0) - 1], work?.year].filter(Boolean).join(" ");

export const getTaskFieldWorkState = ({
  work,
  selectedWorkId,
  locallyReleasedWorkIds,
  serverSelectedWorkId,
}: {
  work: any;
  selectedWorkId: string | null;
  locallyReleasedWorkIds: string[];
  serverSelectedWorkId: string | null;
}) => {
  const workId = getTaskFieldWorkId(work);
  const isSelected = selectedWorkId === workId;
  const isLocallyReleased = locallyReleasedWorkIds.includes(workId);
  const isUsedByAnotherTask =
    isTaskFieldWorkUsed(work) &&
    !isSelected &&
    !isLocallyReleased &&
    serverSelectedWorkId !== workId;

  return {
    workId,
    isSelected,
    isUsedByAnotherTask,
    isDisabled: !isSelected && isUsedByAnotherTask,
  };
};
