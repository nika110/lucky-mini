import { FC, useEffect, useState } from "react";
import DigitWheel from "../UI/digitsRotation/DigitsRotation";
import { calculateDigitChanges } from "./utils";

interface AmountShowcaseProps {
  defaultAmount: number;
}

const AmountShowcase: FC<AmountShowcaseProps> = ({ defaultAmount }) => {
  const [digitsData, setDigitsData] = useState<number[]>([0]);
  const [amount, setAmount] = useState(defaultAmount);

  useEffect(() => {
    if (amount !== defaultAmount) {
      const calc = calculateDigitChanges(defaultAmount, defaultAmount - amount);
      console.log('calc', calc);
      setDigitsData(calc);
      setAmount(defaultAmount);
    }
  }, [amount, defaultAmount]);

  return (
    <div className="inline-flex items-center justify-end relative">
      {digitsData.map((digit, index) => (
        <DigitWheel trigger={defaultAmount} defaultAmount={digit} key={index} />
      ))}
      {/* <DigitWheel defaultAmount={amount} /> */}
    </div>
  );
};

export { AmountShowcase };
