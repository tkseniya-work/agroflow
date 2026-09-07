import React, {FC} from 'react';
import {Text, StyleSheet} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import {ILinearGradientTextProps} from 'types/component-types';

export const LinearGradientText: FC<ILinearGradientTextProps> = props => {
  const {
    text,
    textStyle = {},
    colors = ['#CE8ABC', '#5784E8'],
    start = {x: 0.6, y: 1},
    end = {x: 0, y: 0.2},
  } = props;

  return (
    // @ts-ignore
    <MaskedView
      maskElement={<Text style={[styles.maskText, textStyle]}>{text}</Text>}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  maskText: {
    backgroundColor: 'transparent',
  },
  text: {
    opacity: 0,
  },
});
