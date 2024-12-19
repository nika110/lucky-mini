import * as React from "react";

import { cn } from "@/lib/utils";
import { PixelWrapper } from "./PixelWrapper/pixelWrapper";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative inline-block">
        <PixelWrapper width={2} color="gray" />
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-none bg-inkwell px-4 py-1.5 placeholder:text-white/30 text-base outline-none ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
