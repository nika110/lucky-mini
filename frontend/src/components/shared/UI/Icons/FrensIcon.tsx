import { FC, SVGProps } from "react";

interface FrensIconProps extends SVGProps<SVGSVGElement> {
  color: "gray" | "white";
}

export const FrensIcon: FC<FrensIconProps> = ({ color, ...props }) => {
  const COLOR_SVG = color === "white" ? "#FFFFFF" : "#525252";

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_301_52)">
        <path
          d="M27.9999 16.2214H26.6699V17.5602H27.9999V16.2214Z"
          fill={COLOR_SVG}
        />
        <path
          d="M2 5H11V11.5L8.375 14.1466L4.5 14L3 12.6831H3.875L3 13L3.5 12.5L2 12V5Z"
          fill="#FFD700"
        />
        <path
          d="M26 5H17V11.5L19.625 14.1466L23.78 14.0588L24.5 12.5L24.875 12.6831L25 12.5L26 11.7708V5Z"
          fill="#FFD700"
        />
        <path
          d="M26.67 14.8899H24.0012V16.2199H26.67V14.8899Z"
          fill={COLOR_SVG}
        />
        <path
          d="M25.3312 12.2212H24.0012V13.5599H25.3312V12.2212Z"
          fill={COLOR_SVG}
        />
        <path
          d="M20.0023 13.5606V10.8919H18.6723V9.55315H17.3336V6.89316H18.6723V5.55441H24.0011V6.89316H25.3311V12.2219H26.6698V4.22441H25.3311V2.88566H24.0011V1.55566H18.6723V2.88566H17.3336V4.22441H16.0036V8.22315H12.0049V4.22441H10.6661V2.88566H9.33611V1.55566H3.99862V2.88566H2.66862V4.22441H1.33862V12.2219H2.66862V6.89316H3.99862V5.55441H9.33611V6.89316H10.6661V9.55315H9.33611V10.8919H8.00611V13.5606H3.99862V14.8906H8.00611V20.2194H9.33611V13.5606H10.6661V12.2219H17.3336V13.5606H18.6723V20.2194H20.0023V14.8906H24.0011V13.5606H20.0023Z"
          fill={COLOR_SVG}
        />
        <path
          d="M22.6713 25.5581H21.3325V26.8881H22.6713V25.5581Z"
          fill={COLOR_SVG}
        />
        <path
          d="M21.3322 24.2263H20.0022V25.5563H21.3322V24.2263Z"
          fill={COLOR_SVG}
        />
        <path
          d="M20.0025 22.8872H17.3337V24.226H20.0025V22.8872Z"
          fill={COLOR_SVG}
        />
        <path
          d="M18.6725 20.219H17.3337V21.5577H18.6725V20.219Z"
          fill={COLOR_SVG}
        />
        <path
          d="M17.3337 14.8899H16.0037V17.5586H17.3337V14.8899Z"
          fill={COLOR_SVG}
        />
        <path
          d="M17.3335 21.5579H10.666V22.8879H17.3335V21.5579Z"
          fill={COLOR_SVG}
        />
        <path
          d="M16.0039 18.8901H12.0051V20.2201H16.0039V18.8901Z"
          fill={COLOR_SVG}
        />
        <path
          d="M12.0048 14.8899H10.666V17.5586H12.0048V14.8899Z"
          fill={COLOR_SVG}
        />
        <path
          d="M8.22282 7.77783H6.89282V10.4466H8.22282V7.77783Z"
          fill={COLOR_SVG}
        />
        <path
          d="M5.22766 7.77783H3.88892V10.4466H5.22766V7.77783Z"
          fill={COLOR_SVG}
        />
        <path
          d="M24.2743 7.77783H22.9443V10.4466H24.2743V7.77783Z"
          fill={COLOR_SVG}
        />
        <path
          d="M21.172 7.77783H19.8333V10.4466H21.172V7.77783Z"
          fill={COLOR_SVG}
        />
        <path
          d="M10.6662 20.219H9.33618V21.5577H10.6662V20.219Z"
          fill={COLOR_SVG}
        />
        <path
          d="M10.6663 22.8872H8.00635V24.226H10.6663V22.8872Z"
          fill={COLOR_SVG}
        />
        <path
          d="M8.00598 24.2263H6.66724V25.5563H8.00598V24.2263Z"
          fill={COLOR_SVG}
        />
        <path
          d="M6.6674 25.5581H5.3374V26.8881H6.6674V25.5581Z"
          fill={COLOR_SVG}
        />
        <path
          d="M3.99894 12.2212H2.66895V13.5599H3.99894V12.2212Z"
          fill={COLOR_SVG}
        />
        <path
          d="M3.99862 14.8899H1.33862V16.2199H3.99862V14.8899Z"
          fill={COLOR_SVG}
        />
        <path
          d="M1.33875 16.2214H0V17.5602H1.33875V16.2214Z"
          fill={COLOR_SVG}
        />
      </g>
      <defs>
        <clipPath id="clip0_301_52">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
