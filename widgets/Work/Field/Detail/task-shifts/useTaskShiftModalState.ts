import { useCallback, useState } from "react";

import type { ShiftPartDetails } from "../../../../../src/types/task.types";

export type TaskShiftAddMode = "online" | "fact";

type Params = {
  getValidAccessToken: () => Promise<string | null>;
};

export const useTaskShiftModalState = ({
  getValidAccessToken,
}: Params) => {
  const [selectedDetails, setSelectedDetails] =
    useState<ShiftPartDetails | null>(null);
  const [selectedEditDetails, setSelectedEditDetails] =
    useState<ShiftPartDetails | null>(null);
  const [editAccessToken, setEditAccessToken] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addMode, setAddMode] = useState<TaskShiftAddMode | null>(null);
  const [addAccessToken, setAddAccessToken] = useState<string | null>(null);

  const openEdit = useCallback(
    async (details: ShiftPartDetails) => {
      const accessToken = await getValidAccessToken();

      setEditAccessToken(accessToken);
      setSelectedEditDetails(details);
    },
    [getValidAccessToken],
  );

  const openAdd = useCallback(
    async (mode: TaskShiftAddMode) => {
      const accessToken = await getValidAccessToken();

      setAddAccessToken(accessToken);
      setAddMode(mode);
      setAddMenuOpen(false);
    },
    [getValidAccessToken],
  );

  const openOnlineAdd = useCallback(() => {
    void openAdd("online");
  }, [openAdd]);

  const openFactAdd = useCallback(() => {
    void openAdd("fact");
  }, [openAdd]);

  const toggleAddMenu = useCallback(() => {
    setAddMenuOpen((previous) => !previous);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedDetails(null);
  }, []);

  const closeEdit = useCallback(() => {
    setSelectedEditDetails(null);
  }, []);

  const closeAdd = useCallback(() => {
    setAddMode(null);
  }, []);

  return {
    addAccessToken,
    addMenuOpen,
    addMode,
    closeAdd,
    closeDetails,
    closeEdit,
    editAccessToken,
    openEdit,
    openFactAdd,
    openOnlineAdd,
    selectedDetails,
    selectedEditDetails,
    setSelectedDetails,
    toggleAddMenu,
  };
};
