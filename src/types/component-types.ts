import EvaIcons from "types/eva-icon-enum";
import * as React from "react";
import {
  DividerProps,
  LayoutProps,
  TextElement,
  TextProps,
} from "@ui-kitten/components";
import {
  GestureResponderEvent,
  ColorValue,
  ScrollViewProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

// -------------------------------- Container --------------------------------
export interface ContainerProps extends LayoutProps {
  useSafeArea?: boolean;
  style?: StyleProp<ViewStyle>;
}

// -------------------------------- Content --------------------------------
export interface ContentProps extends ScrollViewProps {
  padder?: boolean;
  level?: "1" | "2" | "3" | "4" | "5";
}

// -------------------------------- NavigationAction --------------------------------
export interface NavigationActionProps {
  icon?: EvaIcons;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderRadius?: number;
  borderWidth?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  onPress?: () => void;
  title?: string;
  titleStatus?: TextStatusCategory;
  size?: "giant" | "large" | "medium" | "small";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  center?: boolean;
  status?:
    | "basic"
    | "white"
    | "white-fill"
    | "primary"
    | "warning"
    | "placeholder"
    | "warning-fill";
}

// -------------------------------- CustomLayout --------------------------------
export interface ILayoutCustomProps extends LayoutProps {
  flex?: boolean;
  padder?: boolean;
  mt?: number;
  style?: StyleProp<ViewStyle>;
  mb?: number;
  mh?: number;
  mv?: number;
  ml?: number;
  mr?: number;
  ph?: number;
  pt?: number;
  pl?: number;
  pv?: number;
  pb?: number;
  maxWidth?: number;
  minWidth?: number;
  padding?: number;
  border?: number;
  margin?: number;
  opacity?: number;
  alignSelfCenter?: boolean;
  itemsCenter?: boolean;
  wrap?: boolean;
  columnGap?: number;
  gap?: number;
  borderStyle?: "solid" | "dotted" | "dashed" | undefined;
  rowGap?: number;
  horizontal?: boolean;
  overflow?: "visible" | "hidden" | "scroll" | undefined;
  onPress?(): void;
  onLongPress?: (event: GestureResponderEvent) => void;
  level?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | string;
  justify?:
    | "center"
    | "space-between"
    | "flex-start"
    | "flex-end"
    | "space-around"
    | "space-evenly"
    | undefined;
}

// -------------------------------- ProgressBar --------------------------------
export interface ProgressBarProps {
  style?: StyleProp<ViewStyle>;
  progress: number;
  styleBar?: StyleProp<ViewStyle>;
  progressColor?: string;
  containColor?: string;
}

// -------------------------------- Text --------------------------------
export type TextSizeCategory =
  | "header"
  | "t1"
  | "t2"
  | "t3"
  | "t4"
  | "t5"
  | "body"
  | "subhead"
  | "callout"
  | "c1"
  | "c2"
  | "note";

export type TextStatusCategory =
  | "basic"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "control"
  | "placeholder"
  | "white"
  | "black"
  | "caption"
  | "success-dark"
  | "grey"
  | "chambrey"
  | "platinum";

type ReactText = string | number;
declare type ChildElement = ReactText | TextElement;
export interface MyTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
  category?: TextSizeCategory;
  status?: TextStatusCategory;
  children?: ChildElement | ChildElement[] | undefined;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  opacity?: number;
  maxWidth?: number;
  fontSize?: number;
  lineHeight?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  none?: boolean;
  left?: boolean;
  right?: boolean;
  center?: boolean;
  underline?: boolean;
  bold?: boolean;
  italic?: boolean;
  onPress?: () => void;
  fontWeight?:
    | "bold"
    | "normal"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
}

// -------------------------------- RoundedButton --------------------------------
export interface IRoundedButtonProps {
  onPress?(): void;
  status?: "basic" | "placeholder" | "primary" | "transparent";
  icon?: string;
  size?: number;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}
// -------------------------------- LinearGradientText --------------------------------
export type ILinearGradientTextProps = {
  text: string | React.ReactNode;
  textStyle?: TextStyle;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

// -------------------------------- Dividers --------------------------------
export interface IDividerProps extends DividerProps {
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  margin?: number;
  style?: ViewStyle;
  level?: string;
}
