import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { FC, useEffect, useRef, useState } from "react";

interface DigitWheelProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "lg" | "md" | "sm";
  trigger: number;
  defaultAmount?: number;
}

enum SIZES {
  lg = "text-2xl",
  md = "text-lg",
  sm = "text-base",
}

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const DigitWheel: FC<DigitWheelProps> = ({
  size = "lg",
  defaultAmount = 0,
  trigger,
  className,
}) => {
  const textSize = SIZES[size];

  const controls = useAnimationControls();
  const isAnimatingRef = useRef(false);
  const lastAnimationPromiseRef = useRef<Promise<unknown> | null>(null);

  const [amount, setAmount] = useState(defaultAmount);

  const combinedConfig = {
    type: "spring",
    stiffness: 200,
    damping: 30,
    mass: 1,
    restDelta: 0.01,
    velocity: 2,
    restSpeed: 0.5,
  };

  const normalizeToSingleDigit = (num: number): number => {
    return num >= 0 ? num % 10 : (10 + (num % 10)) % 10;
  };

  useEffect(() => {
    const sum = defaultAmount + amount;
    if (amount !== sum) {
      const nextAmount = sum > amount ? sum : defaultAmount;
      // console.log("nextAmount", nextAmount, sum, amount);
      setAmount(nextAmount);
      isAnimatingRef.current = true;

      const animationPromise = controls.start({
        rotateX: (nextAmount - 1) * -36,
        transition: combinedConfig,
      });

      lastAnimationPromiseRef.current = animationPromise;

      animationPromise.then(() => {
        if (lastAnimationPromiseRef.current === animationPromise) {
          isAnimatingRef.current = false;

          const normalizedValue = normalizeToSingleDigit(nextAmount);
          controls.set({
            rotateX: (normalizedValue - 1) * -36,
          });
          setAmount(normalizedValue);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, trigger]);

  // console.log(amount);

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <div className="relative perspective-1000">
        <span className={`opacity-30 ${textSize}`}>0</span>
        <motion.div
          className="absolute w-full h-full transform-style-preserve-3d"
          style={{
            transformOrigin: "center center",
          }}
          // animate={{
          //   rotateX: (defaultAmount - 1) * -36,
          // }}
          animate={controls}
          // transition={isDisabledAnimation ? undefined : combinedConfig}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
            <motion.div
              key={num}
              className={cn(
                `absolute w-full h-full flex items-center justify-center text-white font-bold ${textSize}`,
                className
              )}
              style={{
                backfaceVisibility: "hidden",
                transformOrigin: "center center",
                transform: `rotateX(${(index - 1) * 36}deg) translateZ(80px)`,
              }}
              initial={false}
            >
              {num}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DigitWheel;
