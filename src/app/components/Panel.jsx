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

        if (!ship) {
            setShip(id);
        } else if (
            selectedShip.size === selectedShip.id ||
            selectedShip.size === 0
        ) {
            setShip(id);
        } else if (selectedShip.id === +id && selectedShip.size === 0) {
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
                        <div>{getSquare(el.id, el.size)}</div>
                    </div>
                );
            })}
        </>
    );
}
