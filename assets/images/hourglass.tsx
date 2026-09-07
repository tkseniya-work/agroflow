import React from "react";
import Svg, { G, Path } from "react-native-svg";

interface HourglassIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const HourglassIcon: React.FC<HourglassIconProps> = ({
  width = 64,
  height = 64,
  color = "#0F7F5E",
  strokeWidth = 2.4,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      fill="none"
      viewBox="-4.8 -4.8 33.6 33.6"
    >
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M15 6H9m11 15h-1m0 0H5m14 0a7.773 7.773 0 0 0-3.255-6.325L12 12m-7 9H4m1 0a7.773 7.773 0 0 1 3.255-6.325L12 12m8-9h-1m0 0H5m14 0a7.773 7.773 0 0 1-3.255 6.325L12 12M5 3H4m1 0a7.773 7.773 0 0 0 3.255 6.325L12 12" />
      </G>
    </Svg>
  );
};

export default HourglassIcon;
