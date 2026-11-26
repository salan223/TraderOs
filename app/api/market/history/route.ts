import { rateLimited } from "@/lib/market/cache";
import { getHistory, isHistorySymbol } from "@/lib/market/history";

// History is cached in memory by lib/market/cache (12 hours per symbol).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (rateLimited(request, "history", 20)) {
    return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }
  const symbol = new URL(request.url).searchParams.get("symbol") ?? "";
  if (!isHistorySymbol(symbol)) return Response.json({ error: "Unknown symbol." }, { status: 400 });
  const data = await getHistory(symbol);
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
