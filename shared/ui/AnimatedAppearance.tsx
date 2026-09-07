import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  interpolate,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export enum Animation_Types_Enum {
    SlideTop,
    SlideBottom,
    SlideInRight,
    SlideInLeft,
  }
interface AnimatedAppearanceProps {
  children: React.ReactElement;
  index?: number;
  type?: Animation_Types_Enum;
}

const AnimatedAppearance: React.FC<AnimatedAppearanceProps> = ({
  children,
  index,
  type = Animation_Types_Enum.SlideBottom,
}) => {
  const play = useSharedValue(false);
  const progress = useDerivedValue(() => {
    return play.value
      ? withDelay(
          50 * (index ?? 0),
          withTiming(1, {
            duration: 450,
          })
        )
      : 0;
  });

  React.useEffect(() => {
    play.value = true;
  }, []);

  const slideTop = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    const translateY = interpolate(progress.value, [0, 1], [-100, 0]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const slideBottom = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    const translateY = interpolate(progress.value, [0, 1], [100, 0]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const slideInRight = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    const translateX = interpolate(progress.value, [0, 1], [-200, 0]);

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const slideInLeft = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    const translateX = interpolate(progress.value, [0, 1], [200, 0]);

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const getType = React.useCallback((type: Animation_Types_Enum) => {
    switch (type) {
      case Animation_Types_Enum.SlideTop:
        return slideTop;
      case Animation_Types_Enum.SlideInLeft:
        return slideInLeft;
      case Animation_Types_Enum.SlideInRight:
        return slideInRight;
      default:
        return slideBottom;
    }
  }, []);

  return <Animated.View style={getType(type)}>{children}</Animated.View>;
};

export default AnimatedAppearance;
