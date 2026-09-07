import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import { useTheme } from '@ui-kitten/components';
import Animated from 'react-native-reanimated';
import { useLayout } from 'shared/lib';
import Text  from './Text';

interface ITabBarProps {
  tabs: string[];
  level?: string;
  style?: ViewStyle;
  activeIndex: number;
  onChange(index: number): void;
}

const TabBar = ({ style, activeIndex, onChange, tabs }: ITabBarProps) => {
  const theme = useTheme();
  const AniButton = Animated.createAnimatedComponent(TouchableOpacity);
  const { width } = useLayout();
  const changeIndex = React.useCallback(
    (i: number) => {
      return onChange(i);
    },
    [activeIndex],
  );
  const refScrollView = React.useRef<ScrollView>(null);
  React.useEffect(() => {
    refScrollView.current?.scrollTo({
      x: activeIndex * 120 + 8 - (width - 250) / 2,
      animated: true,
    });
  }, [activeIndex]);
  return (
    <View>
      <ScrollView
        contentContainerStyle={[styles.container, style]}
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={refScrollView}>
        {tabs.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <AniButton
              key={index}
              style={[
                styles.btn,
                {
                  borderColor: theme['background-basic-color-2'],
                  backgroundColor: isActive
                    ? theme['color-primary-default']
                    : theme['background-basic-color-1'],
                },
              ]}
              onPress={() => changeIndex(index)}
              activeOpacity={0.7}>
              <Text capitalize category="c1" status={isActive ? 'white' : 'platinum'}>
                {item}
              </Text>
            </AniButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginLeft: 16,
  },
  btn: {
    marginRight: 8,
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 24,
    gap: 4,
  },
});
