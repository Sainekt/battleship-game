import { z } from 'zod';
import { decodeToken } from '../security/token';
import { JWTPayload } from 'jose';
import { fleetCount } from './constants';

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

export function validateSignUpSignIn(data: object) {
    let error: { [key: string]: string } = {};
    const UserSchema = z
        .object({
            username: z.string().min(2).max(100),
            password: z.string().min(5).max(100),
            email: z.string().min(5).max(100).email(),
        })
        .partial({ email: true });

    const result = UserSchema.safeParse({
        ...data,
    });
    if (!result.success) {
        result.error.issues.forEach((value) => {
            error[value.path[0]] = value.message;
        });
        return error;
    }
    return result;
}

export async function validateToken(token: string): Promise<Boolean> {
    try {
        const date: number = new Date().getTime() / 1000;
        const decode: JWTPayload = await decodeToken(token);
        const expred: number = decode.exp - date;
        if (expred > 0) {
            return true;
        }
    } catch {}
    return false;
}

interface SignUpData {
    username: string;
    password: string;
    email: string;
}

export async function validateJson(request: Request): Promise<SignUpData> {
    try {
        const data: SignUpData = await request.json();
        return data;
    } catch {
        return { username: undefined, password: undefined, email: undefined };
    }
}

export function getValidLocalStorageBoard() {
    interface ResultObj {
        shipPlased: boolean;
        storageSquares: Array<string>;
        storageFleet: object;
    }
    let storageFleet;
    let storageSquares: Array<string>;
    const result: ResultObj = {
        shipPlased: false,
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
            if (!(curr in fleetCount)) {
                throw new Error('Invalid local storage: not exists ship type');
            }

            acc[curr] ? acc[curr]++ : (acc[curr] = 1);
            if (acc[curr] > fleetCount[curr]) {
                throw new Error('Invalid local storage: too many sheeps');
            }
            return acc;
        }, {});
        let shipPlasedCount = 0;
        for (const squares in countShips) {
            if (fleetCount[squares] === countShips[squares]) {
                shipPlasedCount += fleetCount[squares];
            }
        }
        result.shipPlased = shipPlasedCount === 20;
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
