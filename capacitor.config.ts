import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.cleanhome.app',
  appName: 'CleanHome',
  webDir: '.',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'CleanHome'
  },
  plugins: {
    Camera: {
      permissionsType: 'camera'
    }
  }
};

export default config;
