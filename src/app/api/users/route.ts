import { HEADERS } from '../../utils/constants';
import { getUsersAll } from '../../db/connection';

export async function GET(request: Request): Promise<Response> {
    try {
        const users = await getUsersAll();
        return new Response(JSON.stringify(users), {
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
