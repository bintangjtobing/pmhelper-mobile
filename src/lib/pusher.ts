import Pusher from 'pusher-js/react-native';
import { API_BASE_URL, getToken } from '../api/client';

/**
 * Pusher credentials. The app key + cluster are public values safe to embed.
 * The secret lives only on the Laravel server and is never exposed to clients.
 */
const PUSHER_KEY = '19d2c0c5eb059c1eb393';
const PUSHER_CLUSTER = 'ap1';

let instance: Pusher | null = null;

export function getPusher(): Pusher {
  if (instance) return instance;

  instance = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    // Private-channel auth — we point Pusher at our Sanctum-protected endpoint
    // and inject the bearer token via a custom authorizer so the request goes
    // through even without session cookies.
    authorizer: (channel) => ({
      authorize: async (socketId, callback) => {
        try {
          const token = await getToken();
          if (!token) {
            callback(new Error('No auth token') as any, null as any);
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
            callback(new Error(`auth failed: ${res.status}`) as any, null as any);
            return;
          }
          const data = await res.json();
          callback(null as any, data);
        } catch (e) {
          callback(e as any, null as any);
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
