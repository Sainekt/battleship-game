import { HEADERS } from '../../../utils/constants';
import { getUserAllInfo } from '../../../db/connection';
import { validateToken } from '../../../utils/validatorsServer';
import { decodeToken } from '../../../security/token';

export async function GET(request: Request): Promise<Response> {
    const tokenobj = request.headers.get('authorization');

    if (!tokenobj) {
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
            status: 401,
            headers: HEADERS,
        });
    }
    const [prefix, token] = tokenobj.split(' ');
    if (prefix !== 'Bearer' || !(await validateToken(token))) {
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
            status: 401,
            headers: HEADERS,
        });
    }
    const payload = await decodeToken(token);
    try {
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
