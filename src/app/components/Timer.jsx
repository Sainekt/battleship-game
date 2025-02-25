'use client';
import { useEffect, useState, useRef } from 'react';
import { gameState, userStore } from '../context/Context';
import { socket } from './Room';
import { TIME_FOR_START, TIME_FOR_MOTION } from '../utils/constants';

export default function Timer() {
    const [text, setText] = useState(null);
    const [textTimer, setTextTimer] = useState(null);
    const {
        player1Ready,
        player2Ready,
        game,
        roomId,
        playerMove,
        timer,
        setTimer,
        setMove,
        winner,
        stop,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    const timeOutStart = useRef(null);
    const timeOutGame = useRef(null);

    useEffect(() => {
        if (game || winner) {
            clearTimeout(timeOutStart.current);
            return;
        }

        if (player1Ready && player2Ready && timer === 0) {
            setTimer(TIME_FOR_START);
            setText('The game will start in: ');
        }

        if (timer > 0) {
            timeOutStart.current = setTimeout(() => {
                setTimer(timer - 1);
                if (timer - 1 === 0) {
                    handleStartGame();
                }
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTimer(0);
            clearTimeout(timeOutStart.current);
            socket.emit('checkStart', false);
        }

        function handleStartGame() {
            if (game) {
                return;
            }
            clearTimeout(timeOutStart.current);
            socket.emit('checkStart', true);
        }

        return () => {
            clearTimeout(timeOutStart.current);
        };
    }, [player1Ready, player2Ready, game, timer, playerMove]);

    // move timer
    useEffect(() => {
        if (!game || !playerMove || winner || stop) {
            clearTimeout(timeOutGame.current);
            return;
        }
        username === playerMove && timer > 0
            ? setText(`Yours move: `)
            : setText(`Player's turn: ${playerMove}`);
        if (timer <= 0) {
            setText('turn change...');
        }

        timeOutGame.current = setTimeout(() => {
            setTimer(timer - 1);
            if (!timer) {
                setMove(false);
                if (username === roomId) {
                    setTimeout(() => {
                        socket.emit('changeMotion', playerMove);
                    }, 2000);
                }
            }
        }, 1000);

        return () => {
            clearTimeout(timeOutGame.current);
        };
    }, [playerMove, timer, game, winner, stop]);

    useEffect(() => {
        if (winner) {
            return setTextTimer(
                winner === username ? "You've won" : "You've lost"
            );
        }
        if (timer > 0) {
            return setTextTimer(`${text} ${timer}`);
        } else if (timer <= 0 && game) {
            return setTextTimer(text);
        }
        setTextTimer(null);
    }, [text, timer, winner]);

    return (
        <>
            <div className='text-3xl text-blue-500 p-1 rounded-lg border-2 my-2 min-w-max min-h-14 text-center'>
                {textTimer ? textTimer : null}
            </div>
        </>
    );
}
