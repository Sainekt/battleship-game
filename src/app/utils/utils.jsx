export function getStyle(start = false, disabled = false, ship = false) {
    if (disabled) {
        return 'square-disabled square';
    }
    if (ship && ship !== '•') {
        return 'square-panel square';
    }

    return 'square';
}

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

export function checkLive(ships, board) {
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
    return result
}
