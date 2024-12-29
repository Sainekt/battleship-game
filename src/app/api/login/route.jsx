
export async function GET(req) {
  return new Response(JSON.stringify({ message: 'Data fetched successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
  });
}