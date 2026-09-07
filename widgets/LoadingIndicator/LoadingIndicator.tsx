import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Colors from '../../shared/styles/Colors';

const { width } = Dimensions.get('window');

interface LoadingIndicatorProps {
  visible: boolean;
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible,
  text = ''
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.toast}>
        <ActivityIndicator 
          size="small" 
          color={Colors.greenColor} 
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    maxWidth: width * 0.8,
  },
  spinner: {
    marginRight: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    flexShrink: 1,
  },
});