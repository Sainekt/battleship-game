'use server';
import { validateSignUpSignIn, validateJson } from '../../utils/validators';
import { HEAREDS } from '../../utils/constants';
import { getUser } from '../../db/connection';
import { comparePassword } from '../../security/password';
import { generateToken } from '../../security/token';
interface SignInData {
    username: string;
    password: string;
}

export async function POST(request: Request): Promise<Response> {
    const data: SignInData = await validateJson(request);
    const { username, password } = data;
    const result = validateSignUpSignIn(data);
    if (!result.success) {
        return new Response(JSON.stringify(result), {
            status: 400,
            headers: HEAREDS,
        });
    }
    try {
        const users = await getUser(username);
        if (users.length === 0) {
            return new Response(
                JSON.stringify({ username: 'User not found' }),
                {
                    status: 401,
                    headers: HEAREDS,
                }
            );
        }
        const user = users[0];
        if (!(await comparePassword(password, user.password))) {
            return new Response(
                JSON.stringify({ password: 'incorrect password' }),
                { status: 401, headers: HEAREDS }
            );
        }
        const token = await generateToken(user.username);
        return new Response(JSON.stringify({ token: token }), {
            status: 201,
            headers: HEAREDS,
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'sorry, try again later' }),
            {
                status: 500,
                headers: HEAREDS,
            }
        );
    }
}
