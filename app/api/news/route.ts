import { rateLimited } from "@/lib/market/cache";
import { getNews } from "@/lib/market/news";

// Always run on request: headlines are cached in memory by lib/market/cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (rateLimited(request, "news", 20)) {
    return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }
  const data = await getNews();
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
