import { rateLimited } from "@/lib/market/cache";
import { getQuotes } from "@/lib/market/quotes";

// Always run on request: prices are cached in memory by lib/market/cache,
// never by Next's static cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (rateLimited(request, "quotes", 40)) {
    return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }
  const data = await getQuotes();
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
