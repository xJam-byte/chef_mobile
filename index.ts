// index.ts (самый верх, до любых импортов, если возможно)
declare const global: any;

try {
  const ErrorUtils = (global as any).ErrorUtils;
  if (ErrorUtils?.setGlobalHandler) {
    const prev = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((err: any, isFatal?: boolean) => {
      // это попадёт в терминал Metro + DevTools Logs
      console.log("🔥 GLOBAL ERROR:", err?.message ?? err, err?.stack);
      prev?.(err, isFatal);
    });
  }
} catch {}


import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
