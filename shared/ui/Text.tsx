import React, {memo} from 'react';
import {TouchableOpacity} from 'react-native';
import {Text} from '@ui-kitten/components';
import {MyTextProps, TextSizeCategory} from 'types/component-types';

const AppText = memo(
  function AppText({
    margin,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    marginVertical,
    marginHorizontal,
    opacity,
    uppercase,
    lowercase,
    capitalize,
    none,
    left,
    lineHeight,
    right,
    center,
    underline,
    onPress,
    italic,
    category = 'body',
    status = 'basic',
    children,
    maxWidth,
    style,
    fontWeight,
    ...rest
  }: MyTextProps) {
    const textAlign: 'left' | 'center' | 'right' | 'auto' | 'justify' =
      left ? 'left' : right ? 'right' : center ? 'center' : 'left';
    const textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none' =
      uppercase
        ? 'uppercase'
        : lowercase
          ? 'lowercase'
        : capitalize
          ? 'capitalize'
          : none
            ? 'none'
            : 'none';
    const textDecorationLine:
      | 'none'
      | 'underline'
      | 'line-through'
      | 'underline line-through' = underline ? 'underline' : 'none';
    const fontStyle: 'normal' | 'italic' = italic ? 'italic' : 'normal';

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={!onPress ? 1 : 0.54}>
        <Text
          category={category}
          status={status}
          style={[
            {
              marginLeft: marginLeft,
              margin: margin,
              marginRight: marginRight,
              marginTop: marginTop,
              marginBottom: marginBottom,
              marginVertical: marginVertical,
              marginHorizontal: marginHorizontal,
              opacity: opacity,
              textAlign: textAlign,
              maxWidth: maxWidth,
              lineHeight: lineHeight || getLineHeight(category),
              textTransform: textTransform,
              textDecorationLine: textDecorationLine,
              fontStyle: fontStyle,
              fontWeight: fontWeight,
            },
            style,
          ]}
          {...rest}>
          {children}
        </Text>
      </TouchableOpacity>
    );
  },
);

export default AppText;

const getLineHeight = (category: TextSizeCategory): number => {
  switch (category) {
    case 'header':
      return 48;
    case 't1':
      return 40;
    case 't2':
      return 36;
    case 't3':
      return 32;
    case 't4':
      return 28;
    case 't5':
      return 24;
    case 'body':
      return 20;
    case 'subhead':
      return 20;
    case 'c1':
      return 18;
    case 'c2':
      return 16;
    case 'note':
      return 16;
    default:
      return 24;
  }
};
