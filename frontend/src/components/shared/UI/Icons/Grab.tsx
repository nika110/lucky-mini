import { FC, SVGProps } from "react";

export const GrabIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="96"
    height="6"
    viewBox="0 0 96 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2" width="92" height="2" fill="white" />
    <rect x="2" y="4" width="92" height="2" fill="white" />
    <rect y="2" width="96" height="2" fill="white" />
  </svg>
);
