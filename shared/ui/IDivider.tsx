import * as React from 'react';
import {Divider, useTheme} from '@ui-kitten/components';
import { IDividerProps } from 'types/component-types';

const IDivider = ({
  margin,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginRight,
  marginTop,
  marginVertical,
  style,
  appearance,
  level = '11',
  ...rest
}: IDividerProps) => {
  const theme = useTheme();
  return (
    <Divider
      {...rest}
      style={{
        opacity: 0.2,
        backgroundColor: `${theme[`background-basic-color-${level}`]}`,
        margin: margin,
        height: 0.7,
        flex: 1,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginHorizontal: marginHorizontal,
        marginVertical: marginVertical,
        ...style,
      }}
    />
  );
};
export default IDivider;
