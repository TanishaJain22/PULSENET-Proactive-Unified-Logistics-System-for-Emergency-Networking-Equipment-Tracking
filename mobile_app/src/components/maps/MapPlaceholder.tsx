import React from 'react';
import { View, Text } from 'react-native';

interface MapPlaceholderProps {
  /** Label shown above the "disabled" text */
  title?: string;
  /** Optional list of coordinate pairs to display */
  markers?: { label: string; latitude: number; longitude: number; color: string }[];
}

export const MapPlaceholder = ({
  title = 'Live Map',
  markers = [],
}: MapPlaceholderProps) => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 rounded-xl m-2">
      <Text className="text-5xl mb-3">🗺️</Text>
      <Text className="text-lg font-bold text-gray-700">{title}</Text>
      <Text className="text-sm text-gray-500 mt-1">
        Map Preview (Disabled in Expo Go)
      </Text>

      {markers.length > 0 && (
        <View className="mt-4 bg-white rounded-xl p-4 shadow-sm mx-6 w-4/5">
          {markers.map((marker, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: marker.color }}
              />
              <Text className="text-sm text-gray-700">
                {marker.label}: {marker.latitude.toFixed(4)},{' '}
                {marker.longitude.toFixed(4)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text className="text-xs text-gray-400 mt-3 italic">
        Enable real maps with a dev build + API key
      </Text>
    </View>
  );
};
