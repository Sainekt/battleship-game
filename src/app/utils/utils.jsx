import { VALID_COORD } from './constants';
import { FLEET_COUNT } from '../utils/constants';

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
export function getShipCoord(arr, all = false) {
    const allCoord = [];
    const result = arr.reduce((acc, curr, i) => {
        if (curr) {
            if (!acc[curr]) {
                acc[curr] = [];
            }
            if (all && curr !== '•') allCoord.push(i);
            acc[curr].push(i);
        }
        return acc;
    }, {});
    if (all) return allCoord;

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
            if (shipsCoord[key].length !== FLEET_COUNT[key]) {
                continue;
            }
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
            const coord = VALID_COORD[i]
                ? VALID_COORD[i]
                : [i - 11, i - 10, i - 9, i - 1, i + 1, i + 9, i + 10, i + 11];
            allCoord.push(...coord);
        }
    }
    const result = new Set(allCoord);

    return result;
}

export async function getTokenInRequest(request) {
    const tokenCookiesOrHeaders =
        request.cookies.get('token') || request.headers.get('authorization');
    const tokenValue =
        typeof tokenCookiesOrHeaders === 'object'
            ? tokenCookiesOrHeaders.value
            : tokenCookiesOrHeaders;
    return tokenValue.split(' ');
}

export function setLocalStorageRoomId(roomId) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2);
    now.setSeconds(now.getSeconds() + 15);
    localStorage.setItem(
        'roomId',
        JSON.stringify({ roomId: roomId, exp: now })
    );
}

export function updateLocalStorageGameData(key, value) {
    const data = JSON.parse(localStorage.getItem('gameData')) || {};
    data[key] = value;
    localStorage.setItem('gameData', JSON.stringify(data));
}
export function getLocalStorageGameData() {
    return JSON.parse(localStorage.getItem('gameData')) || {};
}

export function deleteLocalStorageReconnectData() {
    localStorage.removeItem('roomId');
    localStorage.removeItem('gameData');
}

export function checkRoomIdData() {
    const data = JSON.parse(localStorage.getItem('roomId'));
    if (!data) {
        return false;
    }
    const exp = new Date(data.exp);

    if (exp > new Date()) {
        return data.roomId;
    }
    deleteLocalStorageReconnectData();
    return false;
}

export function getHashCode(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}
