import * as React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
// ----------------------------- @Hooks -----------------------------------
import {useLayout} from 'shared/lib';
// ----------------------------- @UU kitten -----------------------------------
import {Icon, Layout, useTheme} from '@ui-kitten/components';
// ----------------------------- @Reduxs -----------------------------------
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
// ----------------------------- @Store -----------------------------------
import {useAtom} from 'jotai';
import {appAlertAtom} from '../store/app';
// ----------------------------- @Text -----------------------------------
import Text from './Text';

const AppMessage = () => {
  const [alert, setAlert] = useAtom(appAlertAtom);
  const offset = useSharedValue(1);
  const delayTimeoutRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const {width, height, top} = useLayout();
  const themes = useTheme();
  const clearAllTimeout = () => {
    delayTimeoutRef?.current?.map(id => {
      clearTimeout(id);
    });
  };

  const renderIcon = () => {
    switch (alert?.type) {
      case 'notification':
        return <Icon pack="assets" name="bell-ringing" style={styles.icon} />;
      case 'success':
        return <Icon pack="assets" name="success" style={styles.icon} />;
      case 'error':
        return <Icon pack="assets" name="error" style={styles.icon} />;
      default:
        return <Icon pack="assets" name="bell-ringing" style={styles.icon} />;
    }
  };
  const getColor = () => {
    switch (alert?.type) {
      case 'notification':
        return themes['background-basic-color-2'];
      case 'success':
        return themes['color-success-default'];
      case 'error':
        return themes['color-danger-default'];
      default:
        return themes['background-basic-color-2'];
    }
  };

  const onClose = () => {
    offset.value = withTiming(1);
    setAlert(null);
  };
  React.useEffect(() => {
    if (alert) {
      offset.value = withTiming(1, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      offset.value = withTiming(0, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      clearAllTimeout();
      let newDelayId = setTimeout(() => {
        onClose();
      }, 5000);
      delayTimeoutRef?.current?.push(newDelayId);
    }
  }, [alert]);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      width: width,
      alignSelf: 'center',
      alignItems: 'flex-start',
      height: height,
      transform: [
        {
          translateX: offset.value * (width / 3 + 24),
        },
      ],
    };
  });
  return alert ? (
    <Animated.View style={[styles.container, animatedStyles]}>
      <TouchableOpacity
        style={{width: width, height: height}}
        activeOpacity={1}
        onPress={() => {
          setAlert(null);
        }}
      />
      <Layout
        level="1"
        style={[
          styles.content,
          {
            borderColor: getColor(),
            shadowColor: getColor(),
            top: top + 40,
            width: width - 32,
          },
        ]}>
        {renderIcon()}
        <Layout style={styles.contentTitle}>
          <Text category="c1">{alert?.title}</Text>
          <Text category="c2">{alert?.message}</Text>
        </Layout>
      </Layout>
    </Animated.View>
  ) : null;
};

export default AppMessage;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  contentTitle: {
    justifyContent: 'space-between',
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginRight: 8,
  },
  content: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 8,
    position: 'absolute',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5.46,
    elevation: 9,
    left: 16,
    alignSelf: 'flex-start',
  },
});
