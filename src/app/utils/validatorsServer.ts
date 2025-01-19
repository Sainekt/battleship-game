'use server';
import { z } from 'zod';
import { decodeToken } from '../security/token';
import { JWTPayload } from 'jose';

export async function validateSignUpSignIn(data: object) {
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

interface GameCreateObj {
    player_1: string;
    player_2: string;
}

export async function validatePlayerJson(
    request: Request
): Promise<GameCreateObj> {
    try {
        const data: GameCreateObj = await request.json();
        return data;
    } catch {
        return { player_1: null, player_2: null };
    }
}

export async function validateUpdateGameJson(request: Request) {
    let error: { [key: string]: string } = {};

    const UpdateChema = z.object({
        winner: z.number(),
        status: z.string().regex(/^(in process|finished)$/, 'invalid status'),
        score: z.number().gte(0).lte(100),
    });
    const data = await request.json();
    const result = UpdateChema.safeParse({ ...data });
    if (!result.success) {
        result.error.issues.forEach((value) => {
            error[value.path[0]] = value.message;
        });
        return { success: false, data: error };
    }
    return result;
}
