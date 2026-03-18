import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'critical' | 'muted';
  className?: string;
}

export const Badge = ({ label, variant = 'primary', className = '' }: BadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/20 text-foreground border-primary/30';
      case 'success':
        return 'bg-primary text-foreground border-primary';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-error text-white border-error';
      case 'muted':
        return 'bg-muted text-foreground border-muted';
      default:
        return 'bg-primary/20 text-foreground border-primary/30';
    }
  };

  return (
    <View className={`px-2 py-0.5 rounded-full border ${getVariantStyles()} ${className}`}>
      <Text className="text-[10px] uppercase font-bold tracking-wider">{label}</Text>
    </View>
  );
};
