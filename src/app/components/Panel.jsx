'use client';
import { AnimateButton } from './AnimateButton';
import Square from './Square';
import { gameState, userStore, useStore } from '../context/Context';
import { useState } from 'react';
import useSendGameState from '../hooks/useSendGameState';
export default function Panel() {
    useSendGameState();

    const {
        fleet,
        setShip,
        ship,
        setSquares,
        setDirection,
        reset,
        ready,
        setReady,
        allShipPlaced,
        checkAllShipPlaced,
        squares,
    } = useStore((state) => state);
    const {
        setMyBoard,
        setPlayer1Ready,
        setPlayer2Ready,
        roomId,
        game,
        player2,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    const [shipName, setShipName] = useState(null);

    function getSquare(size, have) {
        const squares = [];
        for (let i = 0; i < size; i++) {
            squares.push(
                <Square
                    key={i}
                    value={size}
                    text={have - i > 0 ? have : null}
                    onSquareClick={() => choiceShip(size)}
                />
            );
        }
        return squares;
    }

    function choiceShip(id) {
        const selectedShip = fleet.find((select) => select.id === id);
        const prevShip = fleet.find((select) => select.id === +ship);
        if (prevShip) {
            if (prevShip.size !== prevShip.id && prevShip.size !== 0) {
                return;
            }
        }
        setShip(selectedShip.id);
        setShipName(selectedShip.name);
    }

    function handleReset() {
        setSquares(Array(100).fill(null));
        setDirection(null);
        reset();
        checkAllShipPlaced();
        localStorage.removeItem('squares');
        localStorage.removeItem('fleet');
    }

    function handleReady() {
        if (allShipPlaced && roomId && player2) {
            setReady();
            if (username == roomId) {
                setPlayer1Ready(!ready);
            } else {
                setPlayer2Ready(!ready);
            }
            setMyBoard(squares);
        }
    }
    return (
        <>
            <div className=' bg-gray-50 border rounded-lg p-3 m-2 min-w-48'>
                <div className='rounded-lg p-1 border-2 bg-white'>
                    <span className='font-bold text-gray-800'>Selected:</span>{' '}
                    <span className='text-blue-500'>{shipName}</span>
                </div>
                {fleet.map((el, i) => {
                    return (
                        <div key={i} className=''>
                            <div className='flex-row'>
                                <span className='font-bold text-gray-800'>
                                    Qty:
                                </span>{' '}
                                <span className='mr-2'>{el.quantity}</span>
                                <span className=' text-blue-500'>
                                    {el.name}
                                </span>
                            </div>
                            <div>{getSquare(el.id, el.size)}</div>
                        </div>
                    );
                })}
                <div className='flex'>
                    <div className='grow mr-1'>
                        <AnimateButton
                            className='bg-blue-500 w-full rounded-full hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                            onClick={handleReset}
                            disabled={ready}
                            title={'Reset'}
                        />
                    </div>
                    <div className='grow ml-1'>
                        <AnimateButton
                            className='bg-blue-500 rounded-full w-full hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                            onClick={handleReady}
                            disabled={
                                allShipPlaced && roomId && player2 && !game
                                    ? false
                                    : true
                            }
                            title={ready ? 'Unready' : 'Ready'}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
