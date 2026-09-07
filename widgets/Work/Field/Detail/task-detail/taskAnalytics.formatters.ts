const numberFormatters = new Map<number, Intl.NumberFormat>();

const getNumberFormatter = (digits: number) => {
  const cachedFormatter = numberFormatters.get(digits);

  if (cachedFormatter) return cachedFormatter;

  const formatter = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
  });

  numberFormatters.set(digits, formatter);

  return formatter;
};

export const formatAnalyticsNumber = (value?: number, digits = 2) =>
  getNumberFormatter(digits).format(Number(value || 0));

export const getAnalyticsPercent = (fact?: number, total?: number) => {
  if (!total) return 0;

  return Math.min((Number(fact || 0) / Number(total)) * 100, 100);
};

export const getFieldProgressColor = (value: number) => {
  if (value >= 95) return "#12B76A";
  if (value >= 60) return "#F79009";

  return "#F04438";
};
