type OfflineShiftSegment = {
  scanned_at?: string | null;
};

export const getPrecedingPartCloseAt = (
  segments: OfflineShiftSegment[],
): Date | null => {
  if (!segments.length) return null;

  const firstScannedAt = segments
    .map((segment) =>
      segment.scanned_at ? new Date(segment.scanned_at).getTime() : Number.NaN,
    )
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0];

  if (!Number.isFinite(firstScannedAt)) return null;

  return new Date(firstScannedAt - 1000);
};
