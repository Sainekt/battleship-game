'use client';

import { io } from 'socket.io-client';

export const socket = io();

export function UpdateSocketState(state) {
    socket.emit(('updateState', state));
}
