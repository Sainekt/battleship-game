'use server';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);

export async function generateToken(username) {
    const data = { username: username };
    const alg = 'HS256';
    const token = await new jose.SignJWT(data)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(SECRET_KEY);
    return token;
}

export async function decodeToken(token) {
    const decoded = await jose.jwtVerify(token, SECRET_KEY);
    return decoded.payload;
}

export async function setCookieToken(token) {
    const cookieStore = await cookies();
    cookieStore.set('token', `Bearer ${token}`);
    return;
}

export async function removeCookieToken() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return;
}
