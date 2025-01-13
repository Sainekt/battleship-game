'use client';
import { useEffect, useRef } from 'react';
import { gameState, useStore, userStore } from '../context/Context';
import { socket } from './Room';

export default function Timer() {
    const { time, setTime } = useStore((state) => state);
    const { player1Ready, player2Ready, game, roomId } = gameState(
        (state) => state
    );
    const { username } = userStore((state) => state);

    const timOutId = useRef(null);

    useEffect(() => {
        if (game) {
            return;
        }
        if (player1Ready && player2Ready && time === null) {
            setTime(5);
        }

        if (time > 0) {
            timOutId.current = setTimeout(() => {
                setTime(time - 1);
                if (time - 1 === 0) {
                    handleStartGame();
                }
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTime(null);
            clearTimeout(timOutId.current);
            socket.emit('checkStart', false);
        }

        return () => {
            clearTimeout(timOutId.current);
        };
    }, [player1Ready, player2Ready, time, game]);

    const handleStartGame = () => {
        clearTimeout(timOutId.current);
        socket.emit('checkStart', true);
    };

    return <h1>{time && !game ? 'The game will start in: ' + time : null}</h1>;
}
