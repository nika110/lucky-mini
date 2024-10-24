import { FC } from "react";
import cl from "./Loading.module.css";

const CubesLoading: FC = () => {
  return (
    <div className={cl.preloader}>
      <div className={cl.preloaderBox} />
      <div className={cl.preloaderBox} />
      <div className={cl.preloaderBox} />
    </div>
  );
};

export default CubesLoading;
