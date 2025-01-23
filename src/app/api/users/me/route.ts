import { HEADERS } from '../../../utils/constants';
import {
    getUserAllInfo,
    getUserByUsername,
    updateUser,
} from '../../../db/connection';
import { decodeToken } from '../../../security/token';
import { getTokenInRequest } from '../../../utils/utils';
import { hashPassword, comparePassword } from '../../../security/password';
import { validateChangeUserData } from '../../../utils/validatorsServer';

export async function GET(request: Request): Promise<Response> {
    try {
        const [prefix, token] = await getTokenInRequest(request);
        const payload = await decodeToken(token);
        const data = await getUserAllInfo(payload.username);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: HEADERS,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'get user error' }), {
            status: 500,
            headers: HEADERS,
        });
    }
}

export async function PATCH(request: Request): Promise<Response> {
    try {
        const [prefix, token] = await getTokenInRequest(request);
        const payload = await decodeToken(token);
        const users = await getUserByUsername(payload.username);
        const userData = users[0];
        const requestData = await request.json();

        if (!(await comparePassword(requestData.password, userData.password))) {
            return new Response(
                JSON.stringify({ password: 'password is incorrect' }),
                { headers: HEADERS, status: 401 }
            );
        }
        const validatedData = await validateChangeUserData(requestData);
        if (!validatedData.success) {
            return new Response(JSON.stringify(validatedData.data), {
                headers: HEADERS,
                status: 400,
            });
        }
        const data = {};
        for (const key in validatedData.data) {
            if (key === 'newPassword')
                data['password'] = await hashPassword(validatedData.data[key]);
            else data[key] = validatedData.data[key];
        }
        const result = await updateUser(userData.id, data);
        if (!result.affectedRows) {
            return new Response(JSON.stringify({ error: 'not updated' }), {
                headers: HEADERS,
                status: 500,
            });
        }
        const updatedUsers = await getUserByUsername(payload.username);
        return new Response(JSON.stringify(updatedUsers[0]), {
            headers: HEADERS,
            status: 200,
        });
    } catch (err) {
        console.log(`error from patch user: ${err}`);
        return new Response(JSON.stringify({ error: 'get user error' }), {
            status: 500,
            headers: HEADERS,
        });
    }
}
