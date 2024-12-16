export const formatWalletAddress = (
  address: string,
  charsToShow: number = 3
): string => {
  if (!address) return "";
  if (address.length <= charsToShow * 2) return address;

  const start = address.slice(0, charsToShow);
  const end = address.slice(-charsToShow);

  return `${start}...${end}`;
};
