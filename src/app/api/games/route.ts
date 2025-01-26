'use server';
import { createGame, getUsersByUsername } from '../../db/connection';
import { HEADERS } from '../../utils/constants';
import { validatePlayerJson } from '../../utils/validatorsServer';

export async function POST(request: Request): Promise<Response> {
    const data = await validatePlayerJson(request);
    const { player_1, player_2 } = data;
    try {
        const data = await getUsersByUsername([player_1, player_2]);
        if (data.length !== 2) {
            return new Response(JSON.stringify({ deteil: 'User not found' }), {
                headers: HEADERS,
                status: 400,
            });
        }
        const player_1Id =
            data[0].username === player_1 ? data[0].id : data[1].id;
        const player_2Id =
            data[0].username === player_2 ? data[0].id : data[1].id;
        const game = await createGame(player_1Id, player_2Id);
        return new Response(JSON.stringify({ gameId: game }), {
            headers: HEADERS,
            status: 201,
        });
    } catch (error) {
        console.log(`database error: ${error}`);
        return new Response(JSON.stringify({ error: `database error` }), {
            headers: HEADERS,
            status: 500,
        });
    }
}
