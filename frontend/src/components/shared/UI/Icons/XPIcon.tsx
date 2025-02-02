import { FC, SVGProps } from "react";

interface XPIconProps extends SVGProps<SVGSVGElement> {
  color?: "grey" | "yellow";
}

export const XPIcon: FC<XPIconProps> = ({ color, ...props }) => {
  const colorOfPaths = color === "grey" ? "#525252" : "#FFD700";
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.36834 0.0117188H3.39054V3.40222H0V5.38006V7.35786H7.34615L7.37074 0.0117188H5.36834Z"
        fill={colorOfPaths}
      />
      <path
        d="M0 10.657L0 12.6349H3.39051V16.0254H5.36834H7.34614L7.34614 8.67925L0 8.65466L0 10.657Z"
        fill={colorOfPaths}
      />
      <path
        d="M10.6317 16.0117H12.6095V12.6212H16V10.6434V8.66557H8.65385L8.62926 16.0117H10.6317Z"
        fill={colorOfPaths}
      />
      <path
        d="M16 5.36834L16 3.39054L12.6095 3.39054V0L10.6317 0L8.65386 0L8.65386 7.34614L16 7.37073V5.36834Z"
        fill={colorOfPaths}
      />
    </svg>
  );
};
