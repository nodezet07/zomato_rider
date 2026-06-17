import type { Socket } from 'socket.io-client';

import { getSocketUrl } from '@/config/env';
import { getAccessToken } from '@/lib/storage';

type IoFactory = (url: string, opts?: Record<string, unknown>) => Socket;

function getIoFactory(): IoFactory {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('socket.io-client/dist/socket.io.js');
  const io = (typeof mod === 'function' ? mod : mod?.io ?? mod?.default) as IoFactory;
  if (typeof io !== 'function') {
    throw new Error('socket.io-client failed to load');
  }
  return io;
}

let socket: Socket | null = null;

export function getSocketInstance(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const io = getIoFactory();

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
  });

  await new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      socket?.off('connect_error', onError);
      resolve();
    };
    const onError = (err: Error) => {
      socket?.off('connect', onConnect);
      reject(err);
    };
    socket?.once('connect', onConnect);
    socket?.once('connect_error', onError);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
