'use client';
import useStore from '../context/Context';
import Square from './Square';

export default function Panel() {
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
    } = useStore((state) => state);
    
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
        checkAllShipPlaced()
    }

    function handleReady() {
        if (allShipPlaced && !gameStart) {
            setReady()
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
            <button onClick={handleReset} disabled={ready}>RESET</button>
            <button onClick={handleReady} disabled={!allShipPlaced}>{ready ? 'UNREADY' : 'READY'}</button>
        </>
    );
}
