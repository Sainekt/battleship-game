'use client';

import { io } from 'socket.io-client';
import { gameState } from './app/context/Context';

export const socket = io();


