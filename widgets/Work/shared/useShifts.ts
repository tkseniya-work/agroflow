import { useCallback, useMemo } from 'react';
import { ShiftInfo, ShiftSettings } from '../../../entities/productionShift';

export const useShifts = (shiftSettings?: ShiftSettings) => {
  // Настройки смен
  const settings = useMemo(() => {
    const defaultSettings: Required<ShiftSettings> = {
      first_shift_start: '7',
      first_shift_end: '19',
      first_shift_break_start: null,
      first_shift_break_end: null,
      second_shift_start: '19',
      second_shift_end: '7',
      second_shift_break_start: null,
      second_shift_break_end: null,
      id: 'default'
    };

    return shiftSettings ? { ...defaultSettings, ...shiftSettings } : defaultSettings;
  }, [shiftSettings]);

  // Получение типа смены на основе текущего времени
  const getShiftType = useCallback((date: Date = new Date()): number => {
    const currentHour = date.getHours();
    const firstShiftStart = parseInt(settings.first_shift_start);
    const firstShiftEnd = parseInt(settings.first_shift_end);

    if (firstShiftStart < firstShiftEnd) {
      return (currentHour >= firstShiftStart && currentHour < firstShiftEnd) ? 1 : 2;
    } else {
      return (currentHour >= firstShiftStart || currentHour < firstShiftEnd) ? 1 : 2;
    }
  }, [settings]);

  // Получение названия смены
  const getShiftName = useCallback((shiftType: number | null | undefined): string => {
    return shiftType === 1 
      ? "Дневная смена" 
      : "Ночная смена";
  }, []);

   const getShiftNameShort = useCallback((shiftType: number | null | undefined): string => {
    return shiftType === 1 
      ? "День" 
      : "Ночь";
  }, []);

  // Получение временного диапазона смены
  const getShiftTimeRange = useCallback((shiftType: number): string => {
    const start = parseInt(settings.first_shift_start);
    const end = parseInt(settings.first_shift_end);

    if (shiftType === 1) {
      return `${start}:00-${end}:00`;
    } else {
      return `${end}:00-${start}:00`;
    }
  }, [settings]);

  // Полная информация о смене
  const getShiftInfo = useCallback((shiftType?: number): ShiftInfo => {
    const type = shiftType || getShiftType();
    const name = getShiftName(type);
    const timeRange = getShiftTimeRange(type);
    
    return {
      type,
      name,
      timeRange,
      isActive: type === getShiftType()
    };
  }, [getShiftType, getShiftName, getShiftTimeRange]);

  // Получение смены для отображения
  const getDisplayShift = useCallback((shiftType?: number) => {
    const shiftInfo = getShiftInfo(shiftType);
    return {
      ...shiftInfo,
      displayName: `${shiftInfo.name} (${shiftInfo.timeRange})`
    };
  }, [getShiftInfo]);

  // Проверка, является ли время рабочим (в пределах любой смены)
  const isWorkingTime = useCallback((): boolean => {
    const currentHour = new Date().getHours();
    const start = parseInt(settings.first_shift_start);
    const end = parseInt(settings.first_shift_end);

    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }, [settings]);

  // Получение оставшегося времени до конца текущей смены
  const getTimeUntilShiftEnd = useCallback((): { hours: number; minutes: number } | null => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    const shiftEndHour = parseInt(settings.first_shift_end);
    const shiftStartHour = parseInt(settings.first_shift_start);

    let endHour: number;

    if (shiftStartHour < shiftEndHour) {
      // Дневная смена
      endHour = currentHour < shiftStartHour ? shiftStartHour : shiftEndHour;
    } else {
      // Ночная смена или пересекающие смены
      endHour = currentHour >= shiftStartHour ? shiftEndHour + 24 : shiftEndHour;
    }

    const totalEndMinutes = endHour * 60;
    const totalCurrentMinutes = currentHour * 60 + currentMinute;
    
    let minutesUntilEnd = totalEndMinutes - totalCurrentMinutes;
    
    if (minutesUntilEnd < 0) {
      minutesUntilEnd += 24 * 60; // На следующий день
    }

    return {
      hours: Math.floor(minutesUntilEnd / 60),
      minutes: minutesUntilEnd % 60
    };
  }, [settings]);

  return {
    // Основные функции
    getShiftType,
    getShiftName,
    getShiftNameShort,
    getShiftTimeRange,
    getShiftInfo,
    getDisplayShift,
    
    // Время
    isWorkingTime,
    getTimeUntilShiftEnd,
    
    // Данные
    settings,
    
    // Текущее состояние
    currentShift: getShiftInfo(),
    currentShiftType: getShiftType(),
  };
};
