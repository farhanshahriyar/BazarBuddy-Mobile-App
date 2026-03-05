import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ViewProps } from 'react-native';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenWrapper({ children, style, ...props }: ScreenWrapperProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
