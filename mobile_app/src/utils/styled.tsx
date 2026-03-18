/**
 * Styled Component Wrappers
 * 
 * These wrappers intercept the `className` prop (used throughout the codebase
 * for Tailwind-style class names) and strip it before passing to native components.
 * 
 * This prevents the "java.lang.String cannot be cast to java.lang.Boolean" crash
 * that occurs when className strings reach native Android views.
 * 
 * When NativeWind or a Tailwind runtime is added back (via dev build),
 * these wrappers can be replaced with direct react-native imports.
 */
import React from 'react';
import {
  View as RNView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  ScrollView as RNScrollView,
  Pressable as RNPressable,
  FlatList as RNFlatList,
  Image as RNImage,
  ActivityIndicator as RNActivityIndicator,
  Modal as RNModal,
  ViewProps,
  TextProps,
  TextInputProps,
  TouchableOpacityProps,
  ScrollViewProps,
  PressableProps,
  FlatListProps,
  ImageProps,
  ActivityIndicatorProps,
  ModalProps,
} from 'react-native';

// Extend props to accept className (which we strip)
type WithClassName<T> = T & { className?: string };

export const View = ({ className, ...props }: WithClassName<ViewProps>) => (
  <RNView {...props} />
);

export const Text = ({ className, ...props }: WithClassName<TextProps>) => (
  <RNText {...props} />
);

export const TextInput = ({ className, ...props }: WithClassName<TextInputProps>) => (
  <RNTextInput {...props} />
);

export const TouchableOpacity = ({ className, ...props }: WithClassName<TouchableOpacityProps>) => (
  <RNTouchableOpacity {...props} />
);

export const ScrollView = ({ className, ...props }: WithClassName<ScrollViewProps>) => (
  <RNScrollView {...props} />
);

export const Pressable = ({ className, ...props }: WithClassName<PressableProps>) => (
  <RNPressable {...props} />
);

export const FlatList = ({ className, ...props }: WithClassName<FlatListProps<any>>) => (
  <RNFlatList {...props} />
);

export const Image = ({ className, ...props }: WithClassName<ImageProps>) => (
  <RNImage {...props} />
);

export const ActivityIndicator = ({ className, ...props }: WithClassName<ActivityIndicatorProps>) => (
  <RNActivityIndicator {...props} />
);

export const Modal = ({ className, ...props }: WithClassName<ModalProps>) => (
  <RNModal {...props} />
);
