import { log } from 'console';
import { object, string, z } from 'zod';

export async function POST(request: Request): Response {
    let error: { [key: string]: string } = {};
    const User = z.object({
        username: z.string().min(5).max(100),
        password: z.string().min(5).max(100),
        email: z.string().min(5).max(100).email(),
    });
    const data = await request.json();
    const { username, password, email } = data;
    if (!username) {
        error['username'] = 'field is required';
    }
    if (!password) {
        error['password'] = 'field is required';
    }
    if (Object.keys(error).length !== 0) {
        return new Response(JSON.stringify(error), { status: 400 });
    }
}
