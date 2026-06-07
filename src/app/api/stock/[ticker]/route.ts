import { NextResponse } from "next/server";
import { getStockDetail } from "@/lib/providers";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// 個別銘柄の詳細(財務 + 株価推移)を返す。
// GET /api/stock/<ticker>
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const decoded = decodeURIComponent(ticker);
  const detail = await getStockDetail(decoded);

  if (!detail.stock) {
    return NextResponse.json(
      { error: `銘柄が見つかりません: ${decoded}` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ticker: decoded,
    asOf: new Date().toISOString(),
    live: detail.live,
    market: detail.market,
    stock: detail.stock,
    history: detail.history,
  });
}
