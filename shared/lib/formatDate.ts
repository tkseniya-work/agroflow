import dayjs from "dayjs";
import "dayjs/locale/ru";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ru");

export const formatDateWithDay = (date: Date): string => {
  const today = dayjs().startOf("day");
  const lastWeek = today.subtract(1, "week");
  const yesterday = today.subtract(1, "day");
  const givenDate = dayjs(date).startOf("day");

  if (givenDate.isSame(today)) {
    return `Today, ${givenDate.format("DD MMM YYYY hh:mm")}`;
  } else if (givenDate.isSame(yesterday)) {
    return `Yesterday, ${givenDate.format("DD MMM YYYY hh:mm")}`;
  } else if (givenDate.isSame(lastWeek, "week")) {
    return `Last week, ${givenDate.format("DD MMM YYYY hh:mm")}`;
  } else {
    return givenDate.format("DD MMM YYYY hh:mm");
  }
};

export const formatDate = (date: Date): string => {
  const givenDate = dayjs(date);
  return givenDate.format("DD MMM YYYY, HH:mm");
};

export const formatDate2 = (date: Date): string => {
  const givenDate = dayjs(date);
  return givenDate.format("DD.MM.YYYY HH:mm");
};

export const formatDateWithDay2 = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "вчера";

  if (diffDays < 7) {
    return `${diffDays} ${getWord(diffDays, ["день", "дня", "дней"])} назад`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${getWord(weeks, ["неделю", "недели", "недель"])} назад`;
  }

  const months = Math.floor(diffDays / 30);
  return `${months} ${getWord(months, ["месяц", "месяца", "месяцев"])} назад`;
};

const getWord = (number: number, words: [string, string, string]): string => {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return words[0];
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
    return words[1];
  }
  return words[2];
};
