import { FC } from "react";
import cl from "./Navbar.module.css";

const Navbar: FC = () => {
  return (
    <>
      <div className="h-[35px]"></div>
      <div
        className={`sticky z-[49] left-0 right-0 top-[-100%] bottom-5 shadow-[0px_-10px_15px_0_rgba(0,0,0,0.4)] flex flex-nowrap items-center justify-center bg-inkwell h-[71px] w-[calc(100%-32px)] mx-auto ${cl.navbar}`}
      >
        <PixelWrapperNavbar />
        NAVBAR
      </div>
    </>
  );
};

const PixelWrapperNavbar: FC = () => (
  <div className="w-full h-full pointer-events-none absolute">
    {/* LINES */}
    <div
      className={`absolute left-[-3px] bottom-0 right-auto m-auto top-0 h-[calc(100%-6px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-3px] bottom-auto left-auto m-auto top-[3px] h-[calc(100%+3px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-6px] bottom-auto left-auto m-auto top-[9px] h-[calc(100%-6px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-9px] bottom-auto left-auto m-auto top-[12px] h-[calc(100%-12px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 bottom-auto right-0 m-auto top-[-3px] w-[calc(100%-6px)] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 top-auto right-0 m-auto bottom-[-3px] w-full h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-[3px] top-auto right-0 m-auto bottom-[-6px] w-[calc(100%-3px)] h-[3px] bg-liquor`}
    />
    {/* CORNERS */}
    <div
      className={`absolute left-0 bottom-auto right-auto m-auto top-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-0 bottom-auto left-auto m-auto top-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-0 top-auto left-auto m-auto bottom-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 top-auto right-auto m-auto bottom-0 w-[3px] h-[3px] bg-liquor`}
    />
  </div>
);

export default Navbar;
