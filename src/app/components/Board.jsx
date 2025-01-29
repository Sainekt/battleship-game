'use client';
import Square from './Square';
import { useState, useEffect } from 'react';
import { getStyle, markerMiss } from '../utils/utils';
import {
    validatePlace,
    getValidLocalStorageBoard,
} from '../utils/validatorsClient';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from './Room';
import { CHAR_LIST } from '../utils/constants';
import { TIME_FOR_MOTION } from '../utils/constants';

function getBoard(squares, disabled = false, handleClick, start = false) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 10; colIndex++) {
            const index = rowIndex * 10 + colIndex;
            const styleClass = getStyle(start, disabled, squares[index]);

            row.push(
                <Square
                    key={index}
                    value={index}
                    disabled={disabled}
                    onSquareClick={handleClick}
                    className={styleClass}
                    text={squares[index]}
                />
            );
        }
        rows.push(
            <div key={rowIndex} className='board-row'>
                {row}
            </div>
        );
    }
    return rows;
}

export default function Board() {
    const {
        squares,
        setSquares,
        ready,
        fleet,
        squaresBoard2,
        setSquaresBoard2,
        setFleet,
        ship,
        sizeDecrement,
        direction,
        setDirection,
        checkAllShipPlaced,
    } = useStore((state) => state);
    const {
        checkGame,
        myBoard,
        enemyBoard,
        roomId,
        game,
        motion,
        setEnemyBoard,
        move,
        setMove,
        stop,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    useEffect(() => {
        // get data in local storage
        const { storageSquares, storageFleet } = getValidLocalStorageBoard();
        if (storageFleet && storageSquares) {
            setFleet(storageFleet);
            setSquares(storageSquares);
            checkAllShipPlaced();
        }
    }, []);

    useEffect(() => {
        // update board 1 if enemy do shot
        function handleShot(shot) {
            if (!roomId) {
                return;
            }
            if (squares[shot] === 'X' || squares[shot] === '•') {
                return;
            }
            let marker = '•';
            if (squares[shot]) {
                marker = 'X';
                socket.emit('setTimer', TIME_FOR_MOTION);
            }
            if (marker === '•') {
                socket.emit('changeMotion', motion);
            }
            socket.emit('hitOrMiss', [shot, squares[shot]]);
            const newValues = [...squares];
            newValues[shot] = marker;
            const destroyShips = checkGame(myBoard, newValues);
            if (destroyShips.length) {
                const markerMissSquares = markerMiss(destroyShips);
                for (const i of markerMissSquares) {
                    if (!newValues[i]) {
                        newValues[i] = '•';
                    }
                }
            }
            localStorage.setItem('GameSquares', JSON.stringify(newValues));
            setSquares(newValues);
        }

        socket.on('shot', handleShot);
        return () => socket.off('shot', handleShot);
    }, [squares, myBoard, motion]);

    useEffect(() => {
        // update board 2 if player do shot
        function handleHitOrMiss([index, hit]) {
            let marker = '•';
            let newEnemyBoard = [...enemyBoard];
            if (hit) {
                marker = 'X';
                newEnemyBoard[index] = hit;
                setEnemyBoard(newEnemyBoard);
                localStorage.setItem(
                    'enemyBoard',
                    JSON.stringify(newEnemyBoard)
                );
                setMove(true);
            }
            const newValues = [...squaresBoard2];
            newValues[index] = marker;

            const destroyShips = checkGame(newEnemyBoard, newValues);
            if (destroyShips.length) {
                const markerMissSquares = markerMiss(destroyShips);
                for (const i of markerMissSquares) {
                    if (!newValues[i]) {
                        newValues[i] = '•';
                    }
                }
            }
            setSquaresBoard2(newValues);
            localStorage.setItem('gameBoard2', JSON.stringify(newValues));
        }
        socket.on('hitOrMiss', handleHitOrMiss);
        return () => {
            socket.off('hitOrMiss', handleHitOrMiss);
        };
    }, [squaresBoard2, enemyBoard]);

    function handleClickBorad1(event) {
        const index = +event.target.value;
        const selectShip = fleet.find((el) => el.id === +ship);
        if (!selectShip) {
            return;
        }
        const value = selectShip.type[selectShip.quantity - 1];

        if (
            !squares[index] &&
            validatePlace(
                index,
                value,
                selectShip,
                squares,
                direction,
                setDirection
            )
        ) {
            const newValues = [...squares];
            newValues[index] = value;
            sizeDecrement(newValues);
        }
    }
    function handleClickBorad2(event) {
        const index = +event.target.value;
        if (
            !roomId ||
            isNaN(index) ||
            squaresBoard2[index] === 'X' ||
            squaresBoard2[index] === '•'
        ) {
            return;
        }
        if (!move) {
            return;
        }
        setMove(false);
        socket.emit('shot', index);
    }

    const board = getBoard(squares, false, handleClickBorad1);
    const board2 = getBoard(squaresBoard2, !game || stop, handleClickBorad2);

    return (
        <div className='board-container'>
            <div className='board'>
                <div className='board-header'>
                    <div className='board-header-cell'></div>
                    {CHAR_LIST.map((char, index) => (
                        <div key={index} className='board-header-cell'>
                            {char}
                        </div>
                    ))}
                </div>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className='board-row'>
                        <div className='board-header-cell'>{rowIndex + 1}</div>
                        {row}
                    </div>
                ))}
            </div>
            <div className='board'>
                <div className='board-header'>
                    <div className='board-header-cell'></div>
                    {CHAR_LIST.map((char, index) => (
                        <div key={index} className='board-header-cell'>
                            {char}
                        </div>
                    ))}
                </div>
                {board2.map((row, rowIndex) => (
                    <div key={rowIndex} className='board-row'>
                        <div className='board-header-cell'>{rowIndex + 1}</div>
                        {row}
                    </div>
                ))}
            </div>
        </div>
    );
}
