import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
}

export const LoadingIndicator = ({
  message = 'Loading...',
  size = 'large',
  className = '',
}: LoadingIndicatorProps) => {
  return (
    <View className={`flex-1 justify-center items-center p-8 bg-background ${className}`}>
      <ActivityIndicator size={size} color="#72e3ad" />
      {message && (
        <Text className="mt-4 text-foreground/60 font-medium text-sm text-center">
          {message}
        </Text>
      )}
    </View>
  );
};
