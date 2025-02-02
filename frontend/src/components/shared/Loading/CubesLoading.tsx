import { FC } from "react";
import styles from "./Loading.module.css";

interface CubesLoadingProps {
  size?: number;
}

const CubesLoading: FC<CubesLoadingProps> = ({ size = 15 }) => {
  const boxStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className={`relative ${styles.preloader}`}
      style={{ transform: `scale(1.5) translateX(-${size / 3}px)` }}
    >
      <div
        className={`absolute border border-white ${styles.preloaderBox}`}
        style={{ ...boxStyle, left: `-${size * 1.67}px` }}
      />
      <div
        className={`absolute border border-white ${styles.preloaderBox}`}
        style={boxStyle}
      />
      <div
        className={`absolute border border-white ${styles.preloaderBox}`}
        style={{ ...boxStyle, left: `${size * 1.67}px` }}
      />
    </div>
  );
};

export default CubesLoading;
