import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { PixelWrapper } from "./PixelWrapper/pixelWrapper";

const cardVariants = cva("relative", {
  variants: {
    variant: {
      default: "bg-inkwell",
      ghost: "bg-liquor",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <PixelWrapper width={2} color={"gray"} />
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// eslint-disable-next-line react-refresh/only-export-components
export { Card, cardVariants };
