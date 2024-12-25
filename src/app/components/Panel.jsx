'use client';
import useStore from '../context/Context';
import Square from './Square';

export default function Panel() {
    const fleet = useStore((state) => state.fleet1);
    const setShip = useStore((state) => state.setShip);
    const ship = useStore((state) => state.ship);

    function getSquare(size, have) {
        const squares = [];
        
        for (let i = 0; i < size; i++) {
            squares.push(
                <Square
                    key={i}
                    className={ have - i > 0 ? 'square-panel square': 'square'}
                    value={size}
                    // onSquareClick={''}
                />
            );
        }
        return squares;
    }

    function choiceShip(event) {
        const id = event.target.value;
        const shipObj = fleet.find((ship) => ship.id === +id);
        if (shipObj.size !== shipObj.id) {
            return false
        }
        if (ship === null) {
            setShip(id);
        }
        if (ship === id) {
            setShip(null);
        }
    }

    return (
        <>
            {ship ? <h2>selected: size {ship}</h2> : null}
            {fleet.map((el, i) => {
                return (
                    <div key={i}>
                        <h4>Quantity: {el.quantity}</h4>
                        <div onClick={choiceShip}>{getSquare(el.id, el.size)}</div>
                    </div>
                );
            })}
        </>
    );
}
