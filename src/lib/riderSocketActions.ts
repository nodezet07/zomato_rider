import { connectSocket, getSocketInstance } from '@/lib/socketClient';
import { ClientSocketEvents } from '@/lib/socketEvents';

export async function emitRiderOnlineStatus(online: boolean): Promise<void> {
  try {
    const socket = getSocketInstance() ?? (await connectSocket());
    socket.emit(online ? ClientSocketEvents.RIDER_ONLINE : ClientSocketEvents.RIDER_OFFLINE);
  } catch {
    // REST polling still works if socket unavailable
  }
}
