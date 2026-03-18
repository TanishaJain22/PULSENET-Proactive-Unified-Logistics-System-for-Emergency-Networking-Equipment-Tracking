import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-foreground border border-primary';
      case 'secondary':
        return 'bg-muted text-foreground border border-muted';
      case 'danger':
        return 'bg-error text-white border border-error';
      case 'outline':
        return 'bg-transparent border border-primary text-primary';
      default:
        return 'bg-primary text-foreground border border-primary';
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case 'primary':
      case 'outline':
        return 'text-foreground';
      case 'danger':
        return 'text-white';
      case 'secondary':
        return 'text-foreground';
      default:
        return 'text-foreground';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2';
      case 'md':
        return 'px-6 py-4';
      case 'lg':
        return 'px-8 py-5';
      default:
        return 'px-6 py-4';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs uppercase tracking-wider font-bold';
      case 'md':
        return 'text-sm font-semibold';
      case 'lg':
        return 'text-lg font-bold';
      default:
        return 'text-sm font-semibold';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl flex-row justify-center items-center active:opacity-80 disabled:opacity-50 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'danger' ? '#FFFFFF' : '#171717'}
          className="mr-2"
        />
      ) : null}
      <Text className={`text-center ${getTextVariantStyles()} ${getTextSizeStyles()}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
