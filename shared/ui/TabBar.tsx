import { StyleService, useTheme } from "@ui-kitten/components";
import React from "react";
import {
  ColorValue,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Text from "./Text";

interface Props {
  tabs?: string[];
  indicatorIndexes?: number[];
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  backgroundTab?: string | ColorValue;
  backgroundTabActive?: string | ColorValue;
  onChangeTab: (index: number) => void;
  tabActive: number;
  uppercase?: boolean;
  capitalize?: boolean;
}

const TabBar = ({
  tabs,
  indicatorIndexes,
  onChangeTab,
  style,
  tabStyle,
  capitalize,
  uppercase = true,
  backgroundTab,
  tabActive,
  backgroundTabActive,
}: Props) => {
  const theme = useTheme();

  const _onChangeTab = React.useCallback(
    (number: number) => {
      onChangeTab(number);
    },
    [onChangeTab],
  );

  const bg = backgroundTab ?? theme["background-basic-color-3"];
  const activeBg = backgroundTabActive ?? theme["color-primary-default"];

  return (
    <View style={[themedStyles.container, style, { backgroundColor: bg }]}>
      {tabs?.map((item, index) => {
        const isActive = tabActive === index;
        const showIndicator = indicatorIndexes?.includes(index) ?? false;

        return (
          <TouchableOpacity
            accessibilityLabel={
              showIndicator ? `${item}, есть активная смена` : item
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => _onChangeTab(index)}
            key={`${item}-${index}`}
            activeOpacity={0.85}
            style={[
              themedStyles.tabStyle,
              tabStyle,
              isActive && { backgroundColor: activeBg },
            ]}
          >
            <View style={themedStyles.labelContainer}>
              <Text
                capitalize={capitalize}
                uppercase={uppercase}
                center
                status={isActive ? "control" : "basic"}
                category="c2"
                fontWeight="700"
              >
                {item}
              </Text>

              {showIndicator ? (
                <View
                  accessible={false}
                  testID={`tab-status-indicator-${index}`}
                  style={[
                    themedStyles.statusIndicator,
                    {
                      backgroundColor: isActive
                        ? theme["color-basic-100"]
                        : activeBg,
                      borderColor: isActive
                        ? activeBg
                        : theme["background-basic-color-1"],
                    },
                  ]}
                />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;

const themedStyles = StyleService.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: "background-basic-color-4",
  },
  tabStyle: {
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    flex: 1,
    borderWidth: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
  },
});
