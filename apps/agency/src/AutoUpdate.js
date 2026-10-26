import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

/** On launch: fetch OTA update and reload automatically (production only). */
export function AutoUpdateGate({ children }) {
  const [ready, setReady] = useState(__DEV__);

  useEffect(() => {
    if (__DEV__) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          if (!cancelled) {
            await Updates.reloadAsync();
            return;
          }
        }
      } catch {
        // Offline — continue with installed bundle
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.text}>Checking for updates…</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  text: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});
