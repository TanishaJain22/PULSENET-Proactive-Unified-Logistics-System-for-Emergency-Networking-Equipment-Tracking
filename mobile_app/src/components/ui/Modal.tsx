import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({ visible, onClose, title, children, footer }: ModalProps) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white w-full rounded-2xl shadow-xl overflow-hidden max-h-[80%]">
          {/* Header */}
          <View className="px-5 py-4 border-b border-muted flex-row justify-between items-center">
            <Text className="text-lg font-bold text-foreground">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-foreground/50 text-xl font-bold">×</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView className="px-5 py-6">
            {children}
          </ScrollView>

          {/* Footer */}
          {footer ? (
            <View className="px-5 py-4 border-t border-muted">
              {footer}
            </View>
          ) : (
            <View className="px-5 py-4 border-t border-muted">
              <Button title="Close" variant="secondary" onPress={onClose} />
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};
