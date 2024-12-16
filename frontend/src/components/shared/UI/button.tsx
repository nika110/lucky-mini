import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { PixelWrapper } from "./PixelWrapper/pixelWrapper";
import { RoundBtnBg } from "./Icons/RoundBtnBg";
import { RoundedBtnBorders } from "./Icons/RoundedBtnBorders";

const buttonVariants = cva(
  "relative inline-flex items-center uppercase justify-center gap-2 whitespace-nowrap rounded-none text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold text-inkwell active:bg-marigold",
        ghost: "bg-inkwell text-magnet active:bg-dark-bg",
      },
      size: {
        default: "h-9 px-3 py-1",
        rounded:
          "h-[50px] w-[50px] shrink-0 p-0 !bg-transparent !active:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [roundedCover, setRoundedCover] = React.useState(false);

    if (size === "rounded") {
      return (
        <Comp
          className={cn(buttonVariants({ size, className }))}
          ref={ref}
          onMouseEnter={() => setRoundedCover(true)}
          onMouseLeave={() => setRoundedCover(false)}
          onClick={() => setRoundedCover(false)}
          onBlur={() => setRoundedCover(false)}
          onFocus={() => setRoundedCover(true)}
          onTouchStart={() => setRoundedCover(true)}
          onTouchEnd={() => setRoundedCover(false)}
          {...props}
        >
          <RoundBtnBg
            color={roundedCover ? "marigold" : "gold"}
            className="!block left-0 top-0 absolute !w-full !h-full"
          />
          <RoundedBtnBorders className="!block left-0 top-0 absolute !w-full !h-full" />
          <span className="inline-block relative z-[2]">{children}</span>
        </Comp>
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <PixelWrapper width={2} color={variant === "ghost" ? "gray" : "gold"} />
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
