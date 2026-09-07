import {
  ImageRequireSource,
  ImageStyle,
  ListRenderItem,
  StyleProp,
  ViewStyle,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { NameIcon } from "./iconpack-name";

export interface IntroButtonProps {
  title: string;
  onPress(): void;
  isActive?: boolean;
}

export interface IIntroListProps {
  data: IntroButtonProps[];
  title: string;
  contentContainerStyle?: StyleProp<ViewStyle> | undefined;
  renderItem?: ListRenderItem<IntroButtonProps> | null;
  numColumns?: number | undefined;
  refreshing?: boolean | null | undefined;
  horizontal?: boolean | null | undefined;
  initialNumToRender?: number | undefined;
  keyExtractor?:
    | ((item: IntroButtonProps, index: number) => string)
    | undefined;
  columnWrapperStyle?: StyleProp<ViewStyle> | undefined;
  keyboardShouldPersistTaps?:
    | boolean
    | "always"
    | "never"
    | "handled"
    | undefined;
}
export interface IThemeLogoProps {
  source?: ImageRequireSource;
  style?: StyleProp<ImageStyle>;
  onPress?(): void;
  size?: number;
}
export interface ITextContentProps {
  index: number;
  animValue: SharedValue<number>;
  title: string;
  describe: string;
}
export interface IPaginationProps {
  data: any[];
  animValue: SharedValue<number>;
  horizontal?: boolean;
  size?: number;
  space?: number;
  activeWidth?: number;
  activeColor?: string;
  inactiveColor?: string;
}
export interface IOptionProfileProps {
  icon: NameIcon;
  title: string;
  desc: string;
  onPress?(): void;
  style?: StyleProp<ViewStyle>;
}
export enum CurrencyTypeEnum {
  USD = "usd",
  JPY = "jpy",
  EUR = "eur",
  BTC = "btc",
  RUB = "rub",
}
