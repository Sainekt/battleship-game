'use client';
import { FLEET_COUNT, VALID_COORD } from './constants';

// board coord for left and right line
export function getValidLocalStorageBoard() {
    interface ResultObj {
        storageSquares: Array<string>;
        storageFleet: object;
    }
    let storageFleet: Array<object>;
    let storageSquares: Array<string>;
    const result: ResultObj = {
        storageSquares: null,
        storageFleet: null,
    };
    try {
        storageSquares = JSON.parse(localStorage.getItem('squares'));
        storageFleet = JSON.parse(localStorage.getItem('fleet'));
        if (!storageSquares) {
            return result;
        }
        const countShips = storageSquares.reduce((acc, curr) => {
            if (!curr) {
                return acc;
            }
            if (!(curr in FLEET_COUNT)) {
                throw new Error('Invalid local storage: not exists ship type');
            }

            acc[curr] ? acc[curr]++ : (acc[curr] = 1);
            if (acc[curr] > FLEET_COUNT[curr]) {
                throw new Error('Invalid local storage: too many ships');
            }
            return acc;
        }, {});
        if (!validatePlaceLocalStorage(storageSquares)) {
            throw new Error(
                'Invalid local storage: invalid location of ships on the field'
            );
        }
        result.storageSquares = storageSquares;
        result.storageFleet = storageFleet;
        return result;
    } catch (error) {
        console.error(error);
        localStorage.removeItem('squares');
        localStorage.removeItem('fleet');
        return result;
    }
}

interface SelectShipObj {
    size: number;
    id: number;
}

export function validatePlace(
    i: number,
    value: string,
    selectShip: SelectShipObj,
    squares: Array<string>,
    direction: string,
    setDirection: Function
) {
    const shipCheck = VALID_COORD[i]
        ? VALID_COORD[i]
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
            let direction: string;
            if (i - index === 10 || i - index === -10) {
                direction = 'v';
            } else if (i - index === 1 || i - index === -1) {
                direction = 'h';
            }
            setDirection(direction);
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

function validatePlaceLocalStorage(storageSquares: Array<String>) {
    const allCoords: Set<number> = new Set();
    const ShipCoords = storageSquares.reduce(
        (acc: object, value: string, i: number) => {
            if (!value) return acc;
            allCoords.add(i);
            if (!acc[value]) {
                acc[value] = [i];
            } else {
                acc[value].push(i);
            }
            return acc;
        },
        {}
    );
    for (const key in ShipCoords) {
        if (ShipCoords[key].length === 1) {
            const i = ShipCoords[key][0];
            const shipCheck = VALID_COORD[i]
                ? VALID_COORD[i]
                : [i - 11, i - 10, i - 9, i - 1, i + 1, i + 9, i + 10, i + 11];
            const shipCheckResult = shipCheck.every(
                (index: number) => !allCoords.has(index)
            );
            if (!shipCheckResult) return false;
            continue;
        }
        const coords = ShipCoords[key];
        let direction = '';
        if (coords[1] - coords[0] === 1) {
            direction = 'h';
        } else if (coords[1] - coords[0] === 10) {
            direction = 'v';
        } else return false;
        const result = coords.reduce(
            (acc: boolean, curr: number, i: number, arr: Array<number>) => {
                if (!acc) return acc;
                if (i === 0) return acc;
                const difference = curr - arr[i - 1];
                if (direction === 'h' && difference === 1) return true;
                if (direction === 'v' && difference === 10) return true;
                return false;
            },
            true
        );
        if (!result) return false;
    }
    return true;
}
