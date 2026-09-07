import { CalendarRange } from '@ui-kitten/components';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const getInitialDateRange = (): CalendarRange<Date> => {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  const startDate = new Date(currentYear, 0, 1);

  return {
    startDate,
    endDate: today
  };
};

export const useDateRange = (): {
  range: CalendarRange<Date>;
  setRange: Dispatch<SetStateAction<CalendarRange<Date>>>;
} => {
  const [range, setRange] = useState<CalendarRange<Date>>({});

  useEffect(() => {
    setRange(getInitialDateRange());
  }, []);

  return {
    range,
    setRange
  };
};