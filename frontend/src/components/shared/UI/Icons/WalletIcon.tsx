import { FC, SVGProps } from "react";

interface WalletIconProps extends SVGProps<SVGSVGElement> {
  color: "gray" | "white";
}

export const WalletIcon: FC<WalletIconProps> = ({ color, ...props }) => {
  const COLOR_SVG = color === "white" ? "#FFFFFF" : "#525252";
  return (
    <svg
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M26.6612 11.9961H25.3312V7.99731H24.0012V11.9961H21.3324V13.3348H20.0024V15.9948H21.3324V17.3335H24.0012V22.6623H25.3312V17.3335H26.6612V15.9948H27.9999V13.3348H26.6612V11.9961ZM24.0012 14.6648H22.6624V13.3348H24.0012V14.6648Z"
        fill={COLOR_SVG}
      />
      <path
        d="M24.0011 22.6624H22.6624V24.0011H24.0011V22.6624Z"
        fill={COLOR_SVG}
      />
      <path
        d="M24.0011 6.66772H22.6624V7.99772H24.0011V6.66772Z"
        fill={COLOR_SVG}
      />
      <path
        d="M22.6624 24.0012H2.6687V25.3312H22.6624V24.0012Z"
        fill={COLOR_SVG}
      />
      <path
        d="M20.0025 1.33008H17.3337V2.66882H20.0025V1.33008Z"
        fill={COLOR_SVG}
      />
      <path
        d="M17.3338 2.6687H14.665V3.9987H17.3338V2.6687Z"
        fill={COLOR_SVG}
      />
      <path
        d="M14.665 1.33008H13.335V2.66882H14.665V1.33008Z"
        fill={COLOR_SVG}
      />
      <path d="M13.335 0H10.6663V1.33H13.335V0Z" fill={COLOR_SVG} />
      <path
        d="M10.6661 1.33008H7.99731V2.66882H10.6661V1.33008Z"
        fill={COLOR_SVG}
      />
      <path d="M7.9976 2.6687H5.32886V3.9987H7.9976V2.6687Z" fill={COLOR_SVG} />
      <path d="M7.9976 2.6687H5.32886V3.9987H7.9976V2.6687Z" fill={COLOR_SVG} />
      <path
        d="M6.6676 7.99731H5.32886V22.6623H6.6676V7.99731Z"
        fill={COLOR_SVG}
      />
      <path
        d="M22.6624 6.66744V5.32869H21.3324V2.6687H20.0024V5.32869H14.6649V3.9987H13.3349V5.32869H5.32869V3.9987H3.9987V5.32869H2.6687V6.66744H22.6624Z"
        fill={COLOR_SVG}
      />
      <path
        d="M2.66882 22.6624H1.33008V24.0011H2.66882V22.6624Z"
        fill={COLOR_SVG}
      />
      <path
        d="M2.66882 6.66772H1.33008V7.99772H2.66882V6.66772Z"
        fill={COLOR_SVG}
      />
      <path d="M1.33 7.99731H0V22.6623H1.33V7.99731Z" fill={COLOR_SVG} />
      <path
        d="M10.6667 1.33423H13.329V2.6665H14.663V4.00215H13.329V5.3284H10.6667H5.33081V3.99839H7.99846V2.66859H10.6667V1.33423Z"
        fill="#FFD700"
      />
      <path
        d="M17.3359 2.67041H20.0003V5.33149H14.6636V3.99926H17.3359V2.67041Z"
        fill="#FFD700"
      />
    </svg>
  );
};
