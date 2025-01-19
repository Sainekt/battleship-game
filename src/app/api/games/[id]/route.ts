import { getGameById, updateGame } from '../../../db/connection';
import { HEADERS } from '../../../utils/constants';
import { validateUpdateGameJson } from '../../../utils/validatorsServer';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: number }> }
) {
    const id = (await params).id;
    try {
        const game = await getGameById(id);
        if (!game) {
            return new Response(
                JSON.stringify({ detail: 'The game does not exist' }),
                { headers: HEADERS, status: 404 }
            );
        }
        return new Response(JSON.stringify(game), {
            headers: HEADERS,
            status: 200,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: HEADERS,
            status: 500,
        });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: number }> }
) {
    const gameId = (await params).id;
    const validData = await validateUpdateGameJson(request);

    if (!validData.success) {
        return new Response(JSON.stringify(validData), {
            headers: HEADERS,
            status: 400,
        });
    }
    try {
        const data = validData.data;
        const result = await updateGame(
            gameId,
            data.status,
            data.winner,
            data.score
        );
        if (!result.affectedRows) {
            return new Response(
                JSON.stringify({ detail: 'The game does not exist' }),
                { headers: HEADERS, status: 404 }
            );
        }
        const game = await getGameById(gameId);
        return new Response(JSON.stringify(game), {
            headers: HEADERS,
            status: 200,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: HEADERS,
            status: 500,
        });
    }
}
