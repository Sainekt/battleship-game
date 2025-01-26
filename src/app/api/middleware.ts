'use server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { validateToken } from '../utils/validatorsServer';
import { HEADERS } from '../utils/constants';
import { getTokenInRequest } from '../utils/utils';

export async function ApiMiddleware(request: NextRequest) {
    try {
        const [bearer, token] = await getTokenInRequest(request);
        const tokenIsValid = await validateToken(token);
        if (bearer !== 'Bearer' || !tokenIsValid) {
            throw new Error('invalid token');
        }
        return NextResponse.next();
    } catch (error) {
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
            headers: HEADERS,
            status: 401,
        });
    }
}
