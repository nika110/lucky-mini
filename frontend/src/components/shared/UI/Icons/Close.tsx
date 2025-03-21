import { FC, SVGProps } from "react";

export const Close: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="3" height="3" fill="white" />
    <rect x="6" y="3" width="2" height="2" fill="white" />
    <rect x="3" y="3" width="2" height="2" fill="white" />
    <rect x="3" y="6" width="2" height="2" fill="white" />
    <rect x="6" y="6" width="2" height="2" fill="white" />
    <rect x="7" y="2" width="2" height="2" fill="white" />
    <rect x="8" y="1" width="2" height="2" fill="white" />
    <rect x="9" width="1" height="2" fill="white" />
    <rect
      x="9"
      y="2"
      width="1"
      height="2"
      transform="rotate(-90 9 2)"
      fill="white"
    />
    <rect x="2" y="2" width="2" height="2" fill="white" />
    <rect x="1" y="1" width="2" height="2" fill="white" />
    <rect y="1" width="2" height="1" fill="white" />
    <rect
      x="1"
      y="2"
      width="2"
      height="1"
      transform="rotate(-90 1 2)"
      fill="white"
    />
    <rect x="2" y="7" width="2" height="2" fill="white" />
    <rect x="1" y="8" width="2" height="2" fill="white" />
    <rect y="9" width="2" height="1" fill="white" />
    <rect
      x="1"
      y="11"
      width="2"
      height="1"
      transform="rotate(-90 1 11)"
      fill="white"
    />
    <rect x="7" y="7" width="2" height="2" fill="white" />
    <rect x="8" y="8" width="2" height="2" fill="white" />
    <rect x="9" y="9" width="1" height="2" fill="white" />
    <rect
      x="9"
      y="10"
      width="1"
      height="2"
      transform="rotate(-90 9 10)"
      fill="white"
    />
  </svg>
);
