'use server';

import {
    validateSignUpSignIn,
    validateJson,
} from '../../utils/validatorsServer';
import { HEADERS } from '../../utils/constants';
import { createUser } from '../../db/connection';

interface SignUpData {
    username: string;
    password: string;
    email: string;
}

export async function POST(request: Request): Promise<Response> {
    const data: SignUpData = await validateJson(request);
    const { username, password, email } = data;
    const result = await validateSignUpSignIn(data);
    if (!result.success) {
        return new Response(JSON.stringify(result), {
            status: 400,
            headers: HEADERS,
        });
    }
    try {
        await createUser(username, password, email);
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'username or email is already exists' }),
            {
                status: 400,
                headers: HEADERS,
            }
        );
    }
    return new Response(null, { status: 201, headers: HEADERS });
}
