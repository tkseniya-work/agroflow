import * as React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
// ----------------------------- UI kitten -----------------------------------
import {useTheme, StyleService, useStyleSheet} from '@ui-kitten/components';
// ----------------------------- Types -----------------------------------
import EvaIcons from 'types/eva-icon-enum';
// ----------------------------- Components -----------------------------------
import {AppIcon} from './AppIcon';
import LayoutCustom from './LayoutCustom';
import Text from './Text';
import {LinearGradientText} from './LinearGradientText';

interface IButtonIntroProps {
  title: string;
  subtitle?: string;
  icon: EvaIcons;
  onPress?(): void;
  color: string;
  style?: StyleProp<ViewStyle>;
}

const ButtonIntro = ({
  title,
  style,
  subtitle,
  color,
  icon,
  onPress,
}: IButtonIntroProps) => {
  const theme = useTheme();
  const styles = useStyleSheet(themedStyles);
  return (
    <LayoutCustom
      horizontal
      style={[styles.container, style]}
      onPress={onPress}>
      <LayoutCustom
        style={[
          styles.layoutIcon,
          {
            backgroundColor: color,
          },
        ]}>
        <AppIcon name={icon} size={40} fill={theme['text-white-color']} />
      </LayoutCustom>
      <LayoutCustom style={styles.layoutTitle} level="3">
        <LinearGradientText text={title} textStyle={styles.title} />
        {subtitle && (
          <Text category="subhead" capitalize status="platinum">
            {subtitle}
          </Text>
        )}
        <LayoutCustom
          style={[
            styles.chervron,
            {
              backgroundColor: color,
            },
          ]}>
          <AppIcon
            name={EvaIcons.ChevronRight}
            size={28}
            fill={theme['text-white-color']}
          />
        </LayoutCustom>
      </LayoutCustom>
    </LayoutCustom>
  );
};

export default ButtonIntro;

const themedStyles = StyleService.create({
  container: {
    justifyContent: 'space-between',
    gap: 16,
    flex: 1,
  },
  layoutIcon: {
    padding: 10,
    borderRadius: 16,
  },
  layoutTitle: {
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 16,
    flex: 1,
    height: '100%',
  },
  chervron: {
    position: 'absolute',
    borderRadius: 99,
    right: -10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk-Bold',
  },
});
