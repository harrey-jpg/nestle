import {Capacitor,registerPlugin} from '@capacitor/core';
export const native=Capacitor.isNativePlatform();
export const platform=Capacitor.getPlatform();
export const messaging=registerPlugin('FirebaseMessaging');
