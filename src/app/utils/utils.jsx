// return class style for square
import { validCoord } from './validators';
export function getStyle(start = false, disabled = false, ship = false) {
    if (disabled) {
        return 'square-disabled square';
    }
    if (ship && ship !== '•') {
        return 'square-panel square';
    }

    return 'square';
}
// return obj ships coordinate -> ship : [1,2,3,4]
function getShipCoord(arr) {
    const result = arr.reduce((acc, curr, i) => {
        if (curr) {
            if (!acc[curr]) {
                acc[curr] = [];
            }
            acc[curr].push(i);
        }
        return acc;
    }, {});
    return result;
}

// return destroyed ships [[...], [...]]
export function checkLife(ships, board) {
    const shipsCoord = getShipCoord(ships);
    const boardCoord = getShipCoord(board);
    const shot = boardCoord.X;
    const result = [];
    if (shot) {
        for (const key in shipsCoord) {
            const shotSet = new Set(shot);
            const allHit = shipsCoord[key].every((coord) => shotSet.has(coord));
            if (allHit) {
                result.push(shipsCoord[key]);
            }
        }
    }
    return result;
}

// if ship is destroyed marker around
export function markerMiss(array) {
    const allCoord = [];
    for (const element of array) {
        for (const i of element) {
            const coord = validCoord[i]
                ? validCoord[i]
                : [i - 11, i - 10, i - 9, i - 1, i + 1, i + 9, i + 10, i + 11];
            allCoord.push(...coord);
        }
    }
    const result = new Set(allCoord);
    console.log(result);

    return result;
}
