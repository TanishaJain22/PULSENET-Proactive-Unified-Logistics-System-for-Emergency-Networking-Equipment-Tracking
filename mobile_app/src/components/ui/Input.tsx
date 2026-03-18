import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <View className={`mb-4 gap-1 ${className}`}>
      {label && <Text className="text-sm font-semibold text-foreground/80 mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border ${
          error ? 'border-error' : 'border-muted'
        } text-foreground text-base rounded-xl px-4 py-4 shadow-sm`}
        placeholderTextColor="#A3A3A3"
        {...props}
      />
      {error && <Text className="text-xs text-error mt-1 font-medium">{error}</Text>}
    </View>
  );
};
