import { Image } from 'react-native';

/** Transparent Urugendo duck — file: apps/passenger/assets/logo.png */
export function BrandLogo({ size = 40, style }) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
