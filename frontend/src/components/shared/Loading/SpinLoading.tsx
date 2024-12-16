import { FC } from "react";
import cl from "./Loading.module.css";

interface SpinLoadingProps {
  className?: string;
}

const SpinLoader: FC<SpinLoadingProps> = ({ className }) => {
  return (
    <div className={cl.container}>
      <div className={`${className} ${cl.loader}`}>
        {/* Top */}
        <div id="block_01" className={`${cl.block} ${cl.active}`}></div>
        <div id="block_02" className={`${cl.block} ${cl.active}`}></div>
        <div id="block_03" className={`${cl.block} ${cl.active}`}></div>
        <div id="block_04" className={`${cl.block} ${cl.active}`}></div>
        <div id="block_0a" className={`${cl.block} ${cl.active}`}></div>
        {/* Right */}
        <div id="block_05" className={cl.block}></div>
        <div id="block_06" className={cl.block}></div>
        <div id="block_07" className={cl.block}></div>
        <div id="block_08" className={cl.block}></div>
        <div id="block_0b" className={cl.block}></div>
        {/* Bottom */}
        <div id="block_09" className={cl.block}></div>
        <div id="block_10" className={cl.block}></div>
        <div id="block_11" className={cl.block}></div>
        <div id="block_12" className={cl.block}></div>
        <div id="block_0c" className={cl.block}></div>
        {/* Left */}
        <div id="block_13" className={cl.block}></div>
        <div id="block_14" className={cl.block}></div>
        <div id="block_15" className={cl.block}></div>
        <div id="block_16" className={cl.block}></div>
        <div id="block_0d" className={`${cl.block} ${cl.active}`}></div>
      </div>
    </div>
  );
};

export default SpinLoader;
