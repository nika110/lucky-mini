import { NANO_TON } from "./MainGame";

export const calculateNanoTonsToBuy = (tons: number, ticketPrice: number) => {
  const amountInTons = Number(
    Math.floor(tons * ticketPrice * 100) / 100
  ).toFixed(2);
  const amountToBuy = amountInTons
    .toString()
    .concat(NANO_TON)
    .replace(/(\d+)\.(\d+)/, "$1$2");
  return amountToBuy;
};
