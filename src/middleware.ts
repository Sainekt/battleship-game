import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from './app/utils/validatorsServer';
import { signInMiddleware } from './app/(pages)/signin/middleware';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/signin') {
        return signInMiddleware(request);
    }
    if (request.nextUrl.pathname === '/signup') {
        return signInMiddleware(request);
    }
    const tokenObj = request.cookies.get('token');
    if (!tokenObj) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
    const [bearer, token] = tokenObj.value.split(' ');
    const tokenIsValid = await validateToken(token);
    if (bearer !== 'Bearer' || !tokenIsValid) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/signin', '/signup'],
};
