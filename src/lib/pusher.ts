import { API_BASE_URL, getToken } from '../api/client';

/**
 * Pusher credentials. The app key + cluster are public values safe to embed.
 * The secret lives only on the Laravel server and is never exposed to clients.
 */
const PUSHER_KEY = '19d2c0c5eb059c1eb393';
const PUSHER_CLUSTER = 'ap1';

let instance: any = null;

/**
 * Lazy-load Pusher via CommonJS require inside the function — some bundler
 * interop combinations serve the UMD namespace object as the import default,
 * so resolve the constructor manually at call time.
 */
function resolvePusherCtor(): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('pusher-js/react-native');
  // Webpack UMD, ES-module, or plain CJS — try each until we find something
  // that looks like a class constructor.
  const candidates = [mod?.default, mod?.Pusher, mod];
  for (const c of candidates) {
    if (typeof c === 'function') return c;
  }
  throw new Error('Could not locate Pusher constructor in pusher-js module');
}

export function getPusher(): any {
  if (instance) return instance;

  const Pusher = resolvePusherCtor();
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
