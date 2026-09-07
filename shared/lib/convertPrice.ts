const convertPrice = (num: number, maxDigits: number = 0) => {
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxDigits,
  });
};

export default convertPrice;
