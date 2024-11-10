import { FC, SVGProps } from "react";

interface MedalProps extends SVGProps<SVGSVGElement> {
  color: "gold" | "silver" | "bronze" | "gray";
}

export const MedalIcon: FC<MedalProps> = ({ color, ...props }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2.08984 2.08984H12.4584V12.4648H2.08984V2.08984Z"
      fill={
        color === "gold"
          ? "#FFC107"
          : color === "silver"
          ? "#B3B3B3"
          : color === "bronze"
          ? "#C66804"
          : "#525252"
      }
    />
    <path
      d="M14.5427 4.15698H12.4574V10.3856H14.5427V4.15698Z"
      fill="#525252"
    />
    <path
      d="M12.4573 10.3855H10.3856V12.4708H12.4573V10.3855Z"
      fill="#525252"
    />
    <path
      d="M12.4573 2.08545H10.3856V4.15713H12.4573V2.08545Z"
      fill="#525252"
    />
    <path d="M10.3858 12.4709H4.1571V14.5426H10.3858V12.4709Z" fill="#525252" />
    <path d="M10.3858 0H4.1571V2.08531H10.3858V0Z" fill="#525252" />
    <path
      d="M4.15712 10.3855H2.08545V12.4708H4.15712V10.3855Z"
      fill="#525252"
    />
    <path
      d="M4.15712 2.08545H2.08545V4.15713H4.15712V2.08545Z"
      fill="#525252"
    />
    <path d="M2.08531 4.15698H0V10.3856H2.08531V4.15698Z" fill="#525252" />
  </svg>
);
