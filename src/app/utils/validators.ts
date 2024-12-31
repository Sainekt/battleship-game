import { object, z } from 'zod';
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
    const date: number = new Date().getTime() / 1000;
    const decode: JWTPayload = await decodeToken(token);
    const expred: number = decode.exp - date;
    if (expred > 0) {
        return true;
    }
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
