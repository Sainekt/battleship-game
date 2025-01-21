import { HEADERS } from '../../../utils/constants';
import { getUserAllInfo } from '../../../db/connection';
import { decodeToken } from '../../../security/token';
import { getTokenInRequest } from '../../../utils/utils';

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
