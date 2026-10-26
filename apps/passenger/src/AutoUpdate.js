import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * On each launch (production builds only):
 * - checks EAS Update while online
 * - downloads + reloads automatically (no update button)
 */
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
        // Offline or no update channel — open the app as-is
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
