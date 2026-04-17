// pusher-js compiles to UMD with __esModule marker — default import doesn't
// always resolve to the constructor under Metro, so use CommonJS require
// and pick .default if present.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PusherModule = require('pusher-js/react-native');
const Pusher: any = PusherModule.default ?? PusherModule;
import { API_BASE_URL, getToken } from '../api/client';

/**
 * Pusher credentials. The app key + cluster are public values safe to embed.
 * The secret lives only on the Laravel server and is never exposed to clients.
 */
const PUSHER_KEY = '19d2c0c5eb059c1eb393';
const PUSHER_CLUSTER = 'ap1';

let instance: any = null;

export function getPusher(): any {
  if (instance) return instance;

  instance = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    // Private-channel auth — we point Pusher at our Sanctum-protected endpoint
    // and inject the bearer token via a custom authorizer so the request goes
    // through even without session cookies.
    authorizer: (channel: { name: string }) => ({
      authorize: async (socketId: string, callback: (err: Error | null, data: any) => void) => {
        try {
          const token = await getToken();
          if (!token) {
            callback(new Error('No auth token'), null);
            return;
          }
          const res = await fetch(`${API_BASE_URL}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Bearer ${token}`,
            },
            body: new URLSearchParams({
              socket_id: socketId,
              channel_name: channel.name,
            }).toString(),
          });
          if (!res.ok) {
            callback(new Error(`auth failed: ${res.status}`), null);
            return;
          }
          const data = await res.json();
          callback(null, data);
        } catch (e) {
          callback(e as Error, null);
        }
      },
    }),
  });

  return instance;
}

export function disconnectPusher() {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
