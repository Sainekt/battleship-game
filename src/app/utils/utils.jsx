// board coord for left and right line
export const validCoord = {
    0: [1, 10, 11],
    10: [0, 1, 11, 20, 21],
    20: [10, 11, 21, 30, 31],
    30: [20, 21, 31, 40, 41],
    40: [30, 31, 41, 50, 51],
    50: [40, 41, 51, 60, 61],
    60: [50, 51, 61, 70, 71],
    70: [60, 61, 71, 80, 81],
    80: [70, 71, 81, 90, 91],
    90: [80, 81, 91],
    9: [8, 18, 19],
    19: [8, 9, 18, 28, 29],
    29: [18, 19, 28, 38, 39],
    39: [28, 29, 38, 48, 49],
    49: [38, 39, 48, 58, 59],
    59: [48, 49, 58, 68, 69],
    69: [58, 59, 68, 78, 79],
    79: [68, 69, 78, 88, 89],
    89: [78, 79, 88, 98, 99],
    99: [88, 89, 98],
};
// return class style for square
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
    return result;
}

export function validatePlace(i, value, selectShip,squares, direction, setDirection) {
    const shipCheck = validCoord[i]
        ? validCoord[i]
        : [i - 11, i - 10, i - 9, i - 1, i + 1, i + 9, i + 10, i + 11];

    for (const index of shipCheck) {
        if (squares[index] && squares[index] !== value) {
            return false;
        }
    }
    const allow = [i - 1, i + 1, i - 10, i + 10];
    if (selectShip.size === selectShip.id) {
        return true;
    }

    for (const index of allow) {
        if (!direction && squares[index] === value) {
            if (i - index === 10 || i - index === -10) {
                setDirection('v');
            } else if (i - index === 1 || i - index === -1) {
                setDirection('h');
            }
            return true;
        }
    }
    const vertical = [i - 10, i + 10];
    const horizintal = [i - 1, i + 1];
    if (direction === 'v') {
        for (const index of vertical) {
            if (squares[index] === value) {
                return true;
            }
        }
    }
    if (direction === 'h') {
        for (const index of horizintal) {
            if (squares[index] === value) {
                return true;
            }
        }
    }

    return false;
}
