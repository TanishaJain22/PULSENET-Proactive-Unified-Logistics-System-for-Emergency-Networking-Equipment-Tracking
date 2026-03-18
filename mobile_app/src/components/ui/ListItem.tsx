import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export const ListItem = ({
  title,
  subtitle,
  onPress,
  icon,
  rightElement,
  className = '',
}: ListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-5 py-4 bg-white border-b border-muted active:bg-muted/30 ${className}`}
    >
      {icon && <View className="mr-4">{icon}</View>}
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-foreground/60 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightElement || (
          <Text className="text-foreground/30 font-bold ml-2">→</Text>
      )}
    </TouchableOpacity>
  );
};
