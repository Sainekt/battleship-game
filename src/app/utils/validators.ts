import { z } from 'zod';
import { decodeToken } from '../security/token';
import { JWTPayload } from 'jose';

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
    const fleetCount = {
        A: 4,
        B: 3,
        C: 3,
        D: 2,
        E: 2,
        F: 2,
        G: 1,
        H: 1,
        I: 1,
        J: 1,
        X: 20,
        '•': 79,
    };
    let storageFleet;
    let storageSquares;
    try {
        storageSquares = JSON.parse(localStorage.getItem('squares'));
        storageFleet = JSON.parse(localStorage.getItem('fleet'));
        const countShips = storageSquares.reduce((acc, curr) => {
            if (acc[curr]) {
                acc[curr]++;
                if (acc[curr] > fleetCount[curr]) {
                    throw new Error('Invalid fleet');
                }
            } else {
                acc[curr] = 1;
            }
            return acc;
        }, {});
        let shipPlasedCount = 0;
        for (const squares in countShips) {
            if (fleetCount[squares] === countShips[squares]) {
                shipPlasedCount += fleetCount[squares];
            }
        }
        
        const shipPlased = shipPlasedCount === 20 ? true : false;
        return shipPlased        
    } catch (error) {
        localStorage.removeItem('squares');
        localStorage.removeItem('fleet');
    }
}
