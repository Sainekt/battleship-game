'use server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { validateToken } from '../utils/validatorsServer';
import { HEADERS } from '../utils/constants';
import { getTokenInRequest } from '../utils/utils';
import { decodeToken } from '../security/token';

export async function ApiMiddleware(request: NextRequest) {
    try {
        const [bearer, token] = await getTokenInRequest(request);
        const tokenIsValid = await validateToken(token);
        if (bearer !== 'Bearer' || !tokenIsValid) {
            throw new Error('invalid token');
        }
        if (request.nextUrl.pathname.includes('games')) {
            const payload = await decodeToken(token);
            if (payload.username !== 'system') {
                throw new Error('invalid token');
            }
        }
        return NextResponse.next();
    } catch (error) {
        return new Response(JSON.stringify({ detail: 'Forbidden' }), {
            headers: HEADERS,
            status: 403,
        });
    }
}
