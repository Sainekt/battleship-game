'use client';

import { useEffect } from 'react';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from '../components/Room';

export default function useSendGameState() {
    const {
        roomId,
        player1Ready,
        player2Ready,
        player1,
        player2,
        winner,
        boardPlayer1,
        boardPlayer2,
        setPlayer1Ready,
        setPlayer2Ready,
        setBoardPlayer1,
        setBoardPlayer2,
        game,
        setGame,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    const { ready, setReady } = useStore((state) => state);

    const state = {
        roomId,
        player1Ready,
        player2Ready,
        player1,
        player2,
        winner,
        boardPlayer1,
        boardPlayer2,
        username,
        game,
    };

    useEffect(() => {
        if (roomId) {
            socket.emit('sendState', state);
            socket.on('sendState', (state) => {
                if (username === roomId) {
                    setPlayer2Ready(state.player2Ready);
                    setBoardPlayer2(state.boardPlayer2);
                } else {
                    setPlayer1Ready(state.player1Ready);
                    setBoardPlayer1(state.boardPlayer1);
                }
            });
        }
        return () => {
            socket.removeAllListeners('sendState');
        };
    }, [roomId, player1Ready, player2Ready, winner, game]);

    useEffect(() => {
        function checkStart(check) {
            if (ready && check) {
                setGame(true);
            } else {
                setGame(false);
            }
        }
        socket.on('checkStart', checkStart);

        return () => {
            socket.off('checkStart', checkStart);
        };
    }, [ready]);
}
