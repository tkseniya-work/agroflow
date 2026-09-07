export const CURRENCY_SYMBOLS = {
  RUB: "₽",
} as const;

export const formatCurrencyPerUnit = (
  currency: string,
  unitName: string | null
): string => {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || CURRENCY_SYMBOLS.RUB;
  return `${symbol}/${unitName}`;
};

export const formatTimeRange = (openAt: string, closeAt: string): string => {
  if (!openAt) return "Время не указано";

  const openTime = new Date(openAt);
  const closeTime = new Date(closeAt);

  if (isNaN(openTime.getTime())) {
    return "Неверная дата начала";
  }

  const now = new Date();

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (
    !closeTime ||
    isNaN(closeTime.getTime()) ||
    closeTime.getTime() > now.getTime()
  ) {
    return `${formatTime(openTime)} → ${formatTime(closeTime)}`;
  }

  return `${formatTime(openTime)} → ${formatTime(closeTime)}`;
};
