import { FC, SVGProps } from "react";

interface HomeIconProps extends SVGProps<SVGSVGElement> {
  color: "gray" | "white";
}

export const HomeIcon: FC<HomeIconProps> = ({ color, ...props }) => {
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
      <g clip-path="url(#clip0_301_83)">
        <path
          d="M0.669434 14.665H3.32943V13.335H4.66818V11.9963H5.99818V10.6662H7.33693V9.33625H8.66693V7.9975H9.99693V6.6675H11.3357V5.32875H12.6657V3.99875H15.3344V5.32875H16.6644V6.6675H18.0032V7.9975H19.3332V9.33625H20.6632V10.6662H22.0019V11.9963H23.3319V13.335H24.6619V14.665H27.3307V11.9963H26.0007V10.6662H24.6619V9.33625H23.3319V7.9975H22.0019V6.6675H20.6632V5.32875H19.3332V3.99875H18.0032V2.66875H16.6644V1.33H15.3344V0H12.6657V1.33H11.3357V2.66875H9.99693V3.99875H8.66693V5.32875H7.33693V6.6675H5.99818V7.9975H4.66818V9.33625H3.32943V10.6662H1.99943V11.9963H0.669434V14.665Z"
          fill={COLOR_SVG}
        />
        <path
          d="M23.3321 26.6701H18.0033V20.0026H16.6646V28.0001H24.6621V15.9951H23.3321V26.6701Z"
          fill={COLOR_SVG}
        />
        <path
          d="M16.6645 18.6638H15.3345V20.0026H16.6645V18.6638Z"
          fill={COLOR_SVG}
        />
        <path
          d="M15.3345 17.3337H12.6658V18.6637H15.3345V17.3337Z"
          fill={COLOR_SVG}
        />
        <path
          d="M12.6657 18.6638H11.3357V20.0026H12.6657V18.6638Z"
          fill={COLOR_SVG}
        />
        <path
          d="M11.3356 20.0026H9.99685V26.6701H4.6681V15.9951H3.32935V28.0001H11.3356V20.0026Z"
          fill={COLOR_SVG}
        />
        <path d="M23.332 14.665H22.002V15.995H23.332V14.665Z" fill={COLOR_SVG} />
        <path d="M22.0021 13.335H20.6633V14.665H22.0021V13.335Z" fill={COLOR_SVG} />
        <path
          d="M20.6633 11.9963H19.3333V13.3351H20.6633V11.9963Z"
          fill={COLOR_SVG}
        />
        <path
          d="M19.3332 10.6663H18.0032V11.9963H19.3332V10.6663Z"
          fill={COLOR_SVG}
        />
        <path
          d="M18.0033 9.33618H16.6646V10.6662H18.0033V9.33618Z"
          fill={COLOR_SVG}
        />
        <path
          d="M16.6645 7.99756H15.3345V9.33631H16.6645V7.99756Z"
          fill={COLOR_SVG}
        />
        <path
          d="M15.3345 6.66748H12.6658V7.99748H15.3345V6.66748Z"
          fill={COLOR_SVG}
        />
        <path
          d="M12.6657 7.99756H11.3357V9.33631H12.6657V7.99756Z"
          fill={COLOR_SVG}
        />
        <path
          d="M11.3358 9.33618H9.99707V10.6662H11.3358V9.33618Z"
          fill={COLOR_SVG}
        />
        <path
          d="M9.99699 10.6663H8.66699V11.9963H9.99699V10.6663Z"
          fill={COLOR_SVG}
        />
        <path
          d="M8.66691 11.9963H7.33691V13.3351H8.66691V11.9963Z"
          fill={COLOR_SVG}
        />
        <path d="M7.33704 13.335H5.99829V14.665H7.33704V13.335Z" fill={COLOR_SVG} />
        <path d="M5.99821 14.665H4.66821V15.995H5.99821V14.665Z" fill={COLOR_SVG} />
        <path
          d="M23.3305 15.7754H22.0005V17.1054H23.3305V15.7754Z"
          fill={COLOR_SVG}
        />
        <path
          d="M22.0006 14.4453H20.6619V15.7753H22.0006V14.4453Z"
          fill={COLOR_SVG}
        />
        <path
          d="M20.6618 13.1067H19.3318V14.4454H20.6618V13.1067Z"
          fill={COLOR_SVG}
        />
        <path
          d="M19.3317 11.7766H18.0017V13.1066H19.3317V11.7766Z"
          fill={COLOR_SVG}
        />
        <path
          d="M18.0018 10.4465H16.6631V11.7765H18.0018V10.4465Z"
          fill={COLOR_SVG}
        />
        <path d="M16.663 9.10791H15.333V10.4467H16.663V9.10791Z" fill={COLOR_SVG} />
        <path
          d="M15.3331 7.77783H12.6643V9.10783H15.3331V7.77783Z"
          fill={COLOR_SVG}
        />
        <path
          d="M12.6642 9.10791H11.3342V10.4467H12.6642V9.10791Z"
          fill={COLOR_SVG}
        />
        <path
          d="M11.3344 10.4465H9.99561V11.7765H11.3344V10.4465Z"
          fill={COLOR_SVG}
        />
        <path
          d="M9.99553 11.7766H8.66553V13.1066H9.99553V11.7766Z"
          fill={COLOR_SVG}
        />
        <path
          d="M8.66545 13.1067H7.33545V14.4454H8.66545V13.1067Z"
          fill={COLOR_SVG}
        />
        <path
          d="M7.33558 14.4453H5.99683V15.7753H7.33558V14.4453Z"
          fill={COLOR_SVG}
        />
        <path
          d="M5.99675 15.7754H4.66675V17.1054H5.99675V15.7754Z"
          fill={COLOR_SVG}
        />
      </g>
      <defs>
        <clipPath id="clip0_301_83">
          <rect width="28" height="28" fill={COLOR_SVG} />
        </clipPath>
      </defs>
    </svg>
  );
};
