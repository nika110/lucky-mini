import { FC, SVGProps } from "react";

export const GrabCorner: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 9 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="9" height="9" fill="#0a0a0a" />
    <rect x="3" y="6" width="3" height="3" fill="#393939" />
    <rect x="6" y="3" width="3" height="3" fill="#393939" />
    <rect x="6" y="6" width="3" height="3" fill="#1E1E1E" />
  </svg>
);
