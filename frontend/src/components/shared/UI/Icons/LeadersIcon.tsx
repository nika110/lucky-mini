import { FC, SVGProps } from "react";

interface LeadersIconProps extends SVGProps<SVGSVGElement> {
  color: "gray" | "white";
}

export const LeadersIcon: FC<LeadersIconProps> = ({ color, ...props }) => {
  const COLOR_SVG = color === "white" ? "#FFFFFF" : "#525252";

  return (
    <svg
      width="27"
      height="33"
      viewBox="0 0 27 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M26.9999 12.4573H24.9282V14.5426H26.9999V12.4573Z"
        fill={COLOR_SVG}
      />
      <path
        d="M24.9283 14.5425H22.843V16.6142H24.9283V14.5425Z"
        fill={COLOR_SVG}
      />
      <path
        d="M24.9283 10.3857H22.843V12.4574H24.9283V10.3857Z"
        fill={COLOR_SVG}
      />
      <path
        d="M20.7232 20.2512H16.5937V21.9338H14.5357V23.6274H12.4642V21.9338H10.4062V20.2512H6.27673V16.875H4.21875V21.9338H6.27673V32.0625H10.4062V30.3688H12.4642V28.6862H14.5357V30.3688H16.5937V32.0625H20.7232V21.9338H22.7812V16.875H20.7232V20.2512Z"
        fill={COLOR_SVG}
      />
      <path
        d="M20.7711 10.3857H18.6858V16.6144H20.7711V10.3857Z"
        fill={COLOR_SVG}
      />
      <path
        d="M18.6859 16.6143H16.6143V18.6996H18.6859V16.6143Z"
        fill={COLOR_SVG}
      />
      <path
        d="M18.6859 8.31421H16.6143V10.3859H18.6859V8.31421Z"
        fill={COLOR_SVG}
      />
      <path
        d="M20.7712 6.22866V10.3856H22.8429V4.15698H16.6143V6.22866H20.7712Z"
        fill={COLOR_SVG}
      />
      <path
        d="M16.6142 18.6997H10.3855V20.7714H16.6142V18.6997Z"
        fill={COLOR_SVG}
      />
      <path
        d="M16.6144 2.08545H14.5427V4.15713H16.6144V2.08545Z"
        fill={COLOR_SVG}
      />
      <path d="M14.5428 0H12.4575V2.08531H14.5428V0Z" fill={COLOR_SVG} />
      <path
        d="M16.6142 6.22876H10.3855V8.31407H16.6142V6.22876Z"
        fill={COLOR_SVG}
      />
      <path
        d="M12.4572 2.08545H10.3855V4.15713H12.4572V2.08545Z"
        fill={COLOR_SVG}
      />
      <path
        d="M10.3856 16.6143H8.31396V18.6996H10.3856V16.6143Z"
        fill={COLOR_SVG}
      />
      <path
        d="M10.3856 8.31421H8.31396V10.3859H10.3856V8.31421Z"
        fill={COLOR_SVG}
      />
      <path
        d="M8.31382 10.3857H6.22852V16.6144H8.31382V10.3857Z"
        fill={COLOR_SVG}
      />
      <path
        d="M6.22866 6.22866H10.3856V4.15698H4.15698V10.3856H6.22866V6.22866Z"
        fill={COLOR_SVG}
      />
      <path
        d="M4.15708 14.5425H2.07178V16.6142H4.15708V14.5425Z"
        fill={COLOR_SVG}
      />
      <path
        d="M4.15708 10.3857H2.07178V12.4574H4.15708V10.3857Z"
        fill={COLOR_SVG}
      />
      <path d="M2.07168 12.4573H0V14.5426H2.07168V12.4573Z" fill={COLOR_SVG} />
      <rect
        x="10.3865"
        y="8.31104"
        width="6.22686"
        height="10.3865"
        fill="#FFD700"
      />
      <rect
        x="8.30664"
        y="16.6177"
        width="6.22686"
        height="10.3865"
        transform="rotate(-90 8.30664 16.6177)"
        fill="#FFD700"
      />
      <path
        d="M11.25 16.25V15.5H12.75V12.5H12V11.75H12.75V11H14.25V15.5H15.75V16.25H11.25Z"
        fill={COLOR_SVG}
      />
    </svg>
  );
};
