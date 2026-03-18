import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { leafletMapHtml } from './leafletMapHtml';

export interface Location {
  latitude: number;
  longitude: number;
}

interface LeafletMapProps {
  mode: 'dispatch' | 'tracking';
  ambulanceLocation: Location;
  patientLocation?: Location;
  hospitalLocation?: Location;
  routeCoordinates?: [number, number][]; // [lat, lng]
  routeColor?: string;
}

export const LeafletMap = ({
  mode,
  ambulanceLocation,
  patientLocation,
  hospitalLocation,
  routeCoordinates,
  routeColor,
}: LeafletMapProps) => {
  const webViewRef = useRef<WebView>(null);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HOSPITAL_SELECTED' && data.payload) {
        const { latitude, longitude } = data.payload;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
      }
    } catch (e) {
      console.error('WebView Message Error:', e);
    }
  };

  // Push main update when static references change
  useEffect(() => {
    if (webViewRef.current) {
      const payload = {
        mode,
        ambulance: ambulanceLocation,
        patient: patientLocation,
        hospital: hospitalLocation,
        route: routeCoordinates,
        color: routeColor
      };
      webViewRef.current.injectJavaScript(`window.updateMap(${JSON.stringify(payload)});`);
    }
  }, [mode, patientLocation, hospitalLocation, routeCoordinates, routeColor]);

  // Push fast animation updates for the ambulance marker
  useEffect(() => {
    if (webViewRef.current && ambulanceLocation) {
      webViewRef.current.injectJavaScript(`window.animateTo(${JSON.stringify(ambulanceLocation)});`);
    }
  }, [ambulanceLocation]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletMapHtml }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={onMessage}
        onLoadEnd={() => {
          const payload = {
            mode,
            ambulance: ambulanceLocation,
            patient: patientLocation,
            hospital: hospitalLocation,
            route: routeCoordinates,
            color: routeColor
          };
          webViewRef.current?.injectJavaScript(`window.updateMap(${JSON.stringify(payload)});`);
        }}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    flex: 1,
  },
});
