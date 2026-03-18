import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className = '', children, ...props }: CardProps) => {
  return (
    <View
      className={`bg-white rounded-xl shadow-md border border-muted p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <Text className={`text-lg font-bold text-foreground mb-2 ${className}`}>{children}</Text>;
};

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <Text className={`text-sm text-foreground/60 mb-4 ${className}`}>{children}</Text>;
};
