import React from 'react';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Provider } from 'react-redux';
import { store } from './src/store';

import { offlineStorage } from './src/utils/offlineStorage';

export default function App() {
  React.useEffect(() => {
    // Bootstrap: Sync any pending clinical data capturing during previous offline session
    offlineStorage.runSyncRecovery();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </Provider>
  );
}
