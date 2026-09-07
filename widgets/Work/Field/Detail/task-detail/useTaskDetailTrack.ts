import { useEffect, useMemo, useRef, useState } from "react";

import type {
  ProductionTaskTrack,
  Technique,
  Track,
  TrackItem,
} from "../../../../../entities/techniqueMonitoring";
import { normalizeTrackItems } from "../../../../../src/utils/taskUtils";

type TaskTechnique = {
  id?: string | null;
};

type Options = {
  isActive: boolean;
  taskId: string;
  taskTechniques: TaskTechnique[];
  getValidAccessToken: () => Promise<string | null>;
  loadProductionTaskTrack: (data: {
    accessToken: string;
    taskId: string;
  }) => Promise<ProductionTaskTrack | null | undefined>;
};

export const useTaskDetailTrack = ({
  isActive,
  taskId,
  taskTechniques,
  getValidAccessToken,
  loadProductionTaskTrack,
}: Options) => {
  const loadedTrackTaskIdRef = useRef<string | null>(null);
  const [taskTrack, setTaskTrack] = useState<ProductionTaskTrack | null>(null);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [selectedTaskTechniqueId, setSelectedTaskTechniqueId] = useState<
    string | null
  >(taskTechniques[0]?.id ?? null);

  useEffect(() => {
    setTaskTrack(null);
    loadedTrackTaskIdRef.current = null;
  }, [taskId]);

  useEffect(() => {
    if (!selectedTaskTechniqueId && taskTechniques[0]?.id) {
      setSelectedTaskTechniqueId(taskTechniques[0].id);
    }
  }, [selectedTaskTechniqueId, taskTechniques]);

  useEffect(() => {
    if (!isActive) return;
    if (loadedTrackTaskIdRef.current === taskId) return;

    let mounted = true;

    const loadTrack = async () => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) return;

      try {
        setIsTrackLoading(true);

        const response = await loadProductionTaskTrack({
          accessToken,
          taskId,
        });

        if (mounted) {
          setTaskTrack(response ?? null);
          loadedTrackTaskIdRef.current = response?.tracks?.length
            ? taskId
            : null;
        }
      } finally {
        if (mounted) {
          setIsTrackLoading(false);
        }
      }
    };

    loadTrack();

    return () => {
      mounted = false;
    };
  }, [
    getValidAccessToken,
    isActive,
    loadProductionTaskTrack,
    taskId,
  ]);

  const selectedTrack = useMemo<Track | null>(() => {
    if (!taskTrack?.tracks?.length) return null;

    return (
      taskTrack.tracks.find(
        (track) => track.task_technique_id === selectedTaskTechniqueId,
      ) ??
      taskTrack.tracks[0] ??
      null
    );
  }, [selectedTaskTechniqueId, taskTrack?.tracks]);

  const selectedTrackLines = useMemo<TrackItem[]>(
    () => normalizeTrackItems(selectedTrack?.lines),
    [selectedTrack?.lines],
  );

  const selectedMapTechnique = useMemo<Technique[]>(() => {
    if (!selectedTrack?.technique) return [];

    const techniqueStandard =
      (selectedTrack.technique as any).technique_standard ??
      selectedTrack.technique;
    const existingPosition = (selectedTrack.technique as any).last_position;

    const lastLine = selectedTrack.lines?.[selectedTrack.lines.length - 1];
    const lastPosition = lastLine?.c?.[lastLine.c.length - 1];
    const markerPosition = existingPosition ?? lastPosition;

    if (!techniqueStandard?.id || !markerPosition) return [];

    return [
      {
        technique_standard: techniqueStandard,
        last_position: markerPosition,
      },
    ];
  }, [selectedTrack]);

  return {
    taskTrack,
    isTrackLoading,
    selectedTaskTechniqueId,
    setSelectedTaskTechniqueId,
    selectedTrack,
    selectedTrackLines,
    selectedMapTechnique,
  };
};
