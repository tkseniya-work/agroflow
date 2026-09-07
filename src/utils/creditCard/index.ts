export const removeNonNumber = (string = "") => string.replace(/[^\d]/g, "");
export const removeLeadingSpaces = (string = "") => string.replace(/^\s+/g, "");
export function checkCreditCardType(cardNumber: string) {
  // Remove any spaces or dashes from the card number
  const formattedCardNumber = cardNumber.replace(/[^\d]/g, "");

  // Visa
  if (formattedCardNumber.match(/^4/)) {
    return "Visa";
  }

  // Mastercard
  if (formattedCardNumber.match(/^5[1-5]/)) {
    return "Mastercard";
  }

  // American Express
  if (formattedCardNumber.match(/^3[47]/)) {
    return "American Express";
  }

  // Discover
  if (formattedCardNumber.match(/^6011/)) {
    return "Discover";
  }
  // JCB
  if (formattedCardNumber.match(/^35(2[89]|[3-8][0-9])/)) {
    return "JCB";
  }

  // Unknown card type
  return null;
}
// const limitLength = (string = "", maxLength: number) =>
//   string.substr(0, maxLength);
// const addGaps = (string = "", gaps) => {
//   const offsets = [0].concat(gaps).concat([string.length]);

//   return offsets
//     .map((end, index) => {
//       if (index === 0) return "";
//       const start = offsets[index - 1];
//       return string.substr(start, end - start);
//     })
//     .filter((part) => part !== "")
//     .join(" ");
// };

// export const _formatNumber = (number: number, card) => {
//   const numberSanitized = removeNonNumber(number);
//   const maxLength = card.lengths[card.lengths.length - 1];
//   const lengthSanitized = limitLength(numberSanitized, maxLength);
//   const formatted = addGaps(lengthSanitized, card.gaps);
//   return formatted;
// };

// export

// export const _formatCVC = (cvc: string, card) => {
//   const maxCVCLength = card.code.size;
//   return limitLength(removeNonNumber(cvc), maxCVCLength);
// };
