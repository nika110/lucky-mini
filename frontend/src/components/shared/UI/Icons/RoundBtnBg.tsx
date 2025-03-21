import { FC, SVGProps } from "react";

interface RoundBtnBgProps extends SVGProps<SVGSVGElement> {
  color: "marigold" | "gold";
}

export const RoundBtnBg: FC<RoundBtnBgProps> = ({
  color = "marigold",
  ...props
}) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M47.625 14.2813H45.2344V9.51562H42.8594V7.14063H40.4844V4.76562H35.7188V2.375H30.9531V0H19.0469V2.375H14.2813V4.76562H9.53125V7.14063H7.14063V9.51562H4.76562V14.2813H2.375V19.0469H0V30.9531H2.375V35.7188H4.76562V40.4688H7.14063V42.8594H9.53125V45.2344H14.2813V47.625H19.0469V50H30.9531V47.625H35.7188V45.2344H40.4844V42.8594H42.8594V40.4688H45.2344V35.7188H47.625V30.9531H50V19.0469H47.625V14.2813Z"
      className="transition-all duration-200"
      fill={
        color === "gold"
          ? "#FFD700"
          : color === "marigold"
          ? "#ffc107"
          : "#FFD700"
      }
    />
  </svg>
);
