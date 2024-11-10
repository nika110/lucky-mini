export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${Math.floor(num / 1000000)}M`;
  }

  if (num >= 1000) {
    return `${Math.floor(num / 1000)}k`;
  }

  return num.toString();
};
