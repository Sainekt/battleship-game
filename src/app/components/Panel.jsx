'use client';
import Square from './Square';
import { gameState, userStore, useStore } from '../context/Context';
import useSendGameState from '../hooks/useSendGameState';
import { socket } from '../components/Room';
import { getHashCode, getShipCoord } from '../utils/utils';
import { useState } from 'react';
import Notification from './Notification';

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
    const [errorNotification, setErrorNotification] = useState(false);

    function getSquare(size, have) {
        const squares = [];

        for (let i = 0; i < size; i++) {
            squares.push(
                <Square
                    key={i}
                    className={have - i > 0 ? 'square-panel square' : 'square'}
                    value={size}
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
            if (prevShip.size === 0) {
                setShip(selectedShip.id);
            } else if (prevShip.size !== prevShip.id) {
                setShip(prevShip.id);
            } else {
                setShip(selectedShip.id);
            }
        }
        if (!ship) {
            setShip(selectedShip.id);
        }
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
        const allCoords = getShipCoord(squares, true);
        if (allCoords.length !== 20) {
            setErrorNotification(true);
            return;
        }
        if (allShipPlaced && roomId && player2) {
            setReady();
            if (username == roomId) {
                setPlayer1Ready(!ready);
            } else {
                setPlayer2Ready(!ready);
            }
            const hash = getHashCode(JSON.stringify(allCoords));
            socket.emit('saveMyBoardHash', hash);
            setMyBoard(squares);
        }
    }
    return (
        <>
            {errorNotification ? (
                <Notification
                    handleNotification={() => setErrorNotification(false)}
                    data={{
                        title: 'Error',
                        text: 'You have to place all ships on the board',
                    }}
                />
            ) : null}
            {ship ? <h2>selected: size {ship}</h2> : null}
            {fleet.map((el, i) => {
                return (
                    <div key={i}>
                        <h4>Quantity: {el.quantity}</h4>
                        <div>{getSquare(el.id, el.size)}</div>
                    </div>
                );
            })}
            {ready ? <p>you are ready</p> : <p>you are don't ready</p>}
            <button onClick={handleReset} disabled={ready}>
                RESET
            </button>
            <button
                onClick={handleReady}
                disabled={
                    allShipPlaced && roomId && player2 && !game ? false : true
                }
            >
                {ready ? 'UNREADY' : 'READY'}
            </button>
        </>
    );
}
