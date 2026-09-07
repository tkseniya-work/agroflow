import { CurrencyTypeEnum } from "types/element-types";

const formater = (
  number: number,
  currency: CurrencyTypeEnum,
  maximumFractionDigits?: number
) => {
  const option = {
    minimumFractionDigits: 3,
    maximumFractionDigits: maximumFractionDigits ? maximumFractionDigits : 6,
    useGrouping: true,
  };
  switch (currency) {
    case CurrencyTypeEnum.USD:
      return number.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        ...option,
      });
    case CurrencyTypeEnum.EUR:
      return number.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
        ...option,
      });
    case CurrencyTypeEnum.JPY:
      return number.toLocaleString("ja-JP", {
        style: "currency",
        currency: "JPY",
        ...option,
      });
    case CurrencyTypeEnum.BTC:
      return number
        .toLocaleString("en-US", {
          style: "currency",
          currency: "BTC",
          minimumFractionDigits: 6,
          maximumFractionDigits: 10,
        })
        .replace("BTC", "₿");
    case CurrencyTypeEnum.RUB:
      return number.toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        ...option,
      });
    default:
      return number.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        ...option,
      });
  }
};
export default formater;
