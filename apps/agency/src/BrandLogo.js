import { Image } from 'react-native';

/** Transparent Urugendo duck — file: apps/agency/assets/logo.png */
export function BrandLogo({ size = 44, style }) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
