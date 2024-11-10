import { FC } from "react";
import cl from "./pixelWrapper.module.css";

interface PixelWrapperProps {
  width: 2 | 3;
  color: "gray" | "gold";
}

export const PixelWrapper: FC<PixelWrapperProps> = ({ width, color }) => {
  return (
    <div data-color={color} data-width={width + ""} className={cl.wrapper}>
      {/* LINES */}
      <div
        className={`absolute left-0 bottom-auto right-0 m-auto ${cl.part}`}
        style={{
          top: -width,
          width: `calc(100% - ${width * 2}px)`,
        }}
      />
      <div
        className={`absolute left-0 top-auto right-0 m-auto ${cl.part}`}
        style={{
          bottom: -width,
          width: `calc(100% - ${width * 2}px)`,
        }}
      />
      <div
        className={`absolute left-auto top-0 bottom-0 m-auto ${cl.part}`}
        style={{
          right: -width,
          height: `calc(100% - ${width * 2}px)`,
        }}
      />
      <div
        className={`absolute right-auto top-0 bottom-0 m-auto ${cl.part}`}
        style={{
          left: -width,
          height: `calc(100% - ${width * 2}px)`,
        }}
      />

      {/* SQUARES */}
      <div
        className={`absolute top-0 left-0 bottom-auto right-auto m-auto ${cl.part}`}
      />
      <div
        className={`absolute top-0 right-0 bottom-auto left-auto m-auto ${cl.part}`}
      />
      <div
        className={`absolute bottom-0 left-0 top-auto right-auto m-auto ${cl.part}`}
      />
      <div
        className={`absolute bottom-0 right-0 top-auto left-auto m-auto ${cl.part}`}
      />
    </div>
  );
};
