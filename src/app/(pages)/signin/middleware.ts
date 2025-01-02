import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateToken } from '../../utils/validators';

export async function signInMiddleware(request: NextRequest) {
    const tokenObj = request.cookies.get('token');
    if (!tokenObj) {
        return NextResponse.next();
    }
    try {
        const [bearer, token] = tokenObj.value.split(' ');
        const tokenIsValid = await validateToken(token);
        if (tokenIsValid) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    } catch (error) {
        return NextResponse.next()
    }
}
