import { HEAREDS } from '../../../utils/constants';
import { getUser } from '../../../db/connection';
import { validateToken } from '../../../utils/validators';
import { decodeToken } from '../../../security/token';

export async function GET(request: Request): Promise<Response> {
    const tokenobj = request.headers.get('authorization');
    if (!tokenobj) {
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
            status: 401,
            headers: HEAREDS,
        });
    }
    const [prefix, token] = tokenobj.split(' ');
    if (prefix !== 'Bearer' || !(await validateToken(token))) {
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
            status: 401,
            headers: HEAREDS,
        });
    }
    const payload = await decodeToken(token);
    try {
        const users = await getUser(payload.username);
        const user = users[0];
        delete user.password;
        return new Response(JSON.stringify(user), {
            status: 200,
            headers: HEAREDS,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'get user error' }), {
            status: 500,
            headers: HEAREDS,
        });
    }
}
