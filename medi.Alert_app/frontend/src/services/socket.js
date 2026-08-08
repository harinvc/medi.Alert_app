import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log(`⚡ Connected to MedAlert Backend WebSockets: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from MedAlert Backend WebSockets');
});

export default socket;
