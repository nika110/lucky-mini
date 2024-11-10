import React from "react";

interface NumberFormatterProps {
  value: number;
}

const NumberFormatter: React.FC<NumberFormatterProps> = ({ value }) => {
  const formatNumber = (num: number): string => {
    const [whole, decimal] = num.toString().split(".");

    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  };

  return <span>{formatNumber(value)}</span>;
};

export default NumberFormatter;
