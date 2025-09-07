import { io } from 'socket.io-client';
import API_BASE_URL from './pages/apiConfig';


const URL = API_BASE_URL;

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
});
