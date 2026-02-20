import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.intizom.app',
  appName: 'Intizom',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
};

export default config;
