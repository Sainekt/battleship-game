'use client';
import useStore from '../context/Context';
import Square from './Square';

export default function Panel() {
    const fleet = useStore((state) => state.fleet1);
    const setShip = useStore((state) => state.setShip);
    const ship = useStore((state) => state.ship);

    function getSquare(size) {
        const squares = [];
        for (let i = 0; i < size; i++) {
            squares.push(
                <Square
                    key={i}
                    className={'square-panel square'}
                    value={i + 1}
                    // onSquareClick={''}
                />
            );
        }
        return squares;
    }

    function choiceShip(event) {
        const id = event.target.value;
        const shipObj = fleet.find((ship) => ship.id === +id);

        if (ship === null || shipObj.size === shipObj.id) {
            setShip(id);
        }
        if (ship === id) {
            setShip(null);
        }
    }

    return (
        <>
            {fleet.map((el, i) => {
                return (
                    <div key={i}>
                        <h1>Quantity: {el.quantity}</h1>
                        <div onClick={choiceShip}>{getSquare(el.id)}</div>
                    </div>
                );
            })}
        </>
    );
}
