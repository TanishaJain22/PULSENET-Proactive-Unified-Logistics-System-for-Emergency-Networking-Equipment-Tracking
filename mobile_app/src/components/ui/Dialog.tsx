import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog = ({ visible, onClose, title, description, children, footer }: DialogProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-xl w-full max-w-sm overflow-hidden p-6 shadow-xl">
              <View className="mb-4">
                <Text className="text-xl font-bold text-gray-900">{title}</Text>
                {description && <Text className="text-sm text-gray-500 mt-2">{description}</Text>}
              </View>

              {children && <View className="mb-6">{children}</View>}

              {footer && (
                <View className="flex-row justify-end space-x-3 mt-2">
                  {footer}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
