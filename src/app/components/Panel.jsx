'use client';
import Square from './Square';
import { gameState, userStore, useStore } from '../context/Context';
import useSendGameState from '../hooks/useSendGameState';
export default function Panel() {
    useSendGameState();

    const {
        fleet1: fleet,
        setShip,
        ship,
        setSquares,
        setDirection,
        reset,
        ready,
        setReady,
        allShipPlaced,
        checkAllShipPlaced,
        gameStart,
        squares,
    } = useStore((state) => state);
    const {
        setBoardPlayer1,
        setPlayer1Ready,
        setPlayer2Ready,
        roomId,
        setBoardPlayer2,
        player1Ready,
        game,
        player2,
    } = gameState((state) => state);

    const { username } = userStore((state) => state);

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
        localStorage.removeItem('squares')
        localStorage.removeItem('fleet')
    }

    function handleReady() {
        if (allShipPlaced && roomId && player2) {
            setReady();
            if (username == roomId) {
                setBoardPlayer1(squares);
                setPlayer1Ready(!ready);
            } else {
                setPlayer2Ready(!ready);
                setBoardPlayer2(squares);
            }
        }
    }
    return (
        <>
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
