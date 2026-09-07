import { useState, useCallback, useEffect } from "react";

export const useFieldSelection = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let frame: number;

    const animate = () => {
      setPulse((prev) => (prev >= 1 ? 0 : prev + 0.05));
      frame = requestAnimationFrame(animate);
    };

    if (selectedId) {
      animate();
    }

    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  const onPress = useCallback((e: any, fields: any[], onSelect?: any) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const id = feature.properties?.id;
    setSelectedId(id);

    const field = fields.find((f) => f.id === id);
    if (field && onSelect) onSelect(field);
  }, []);

  const onHover = useCallback((e: any) => {
    const feature = e.features?.[0];
    setHoveredId(feature?.properties?.id || null);
  }, []);

  return {
    selectedId,
    hoveredId,
    pulse,
    onPress,
    onHover,
  };
};