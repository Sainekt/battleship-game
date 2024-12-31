import * as jose from 'jose';
import dotenv from 'dotenv';
import { decode } from 'punycode';

dotenv.config({ path: '../../../.env' });

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
