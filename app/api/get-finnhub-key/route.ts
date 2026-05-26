export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY || "";

  return Response.json({ apiKey });
}
