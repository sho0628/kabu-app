import { NextResponse } from "next/server";
import type { GroupBy, Market } from "@/lib/types";
import {
  getAllStocks,
  getStocksForMarket,
  statusFromResults,
} from "@/lib/providers";
import { aggregateGroups } from "@/lib/sectors";

// Vercel等のサーバーレスで Yahoo 取得が時間切れにならないよう上限を延長。
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// セクター/業種別の集計と構成銘柄を返す。
// GET /api/sectors?market=US|JP|ALL&group=sector|industry
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const marketParam = (searchParams.get("market") ?? "ALL").toUpperCase();
  const market: Market | "ALL" =
    marketParam === "US" || marketParam === "JP" ? (marketParam as Market) : "ALL";
  const group: GroupBy =
    searchParams.get("group") === "industry" ? "industry" : "sector";

  let stocks;
  let provider;
  if (market === "ALL") {
    const all = await getAllStocks();
    stocks = all.stocks;
    provider = all.provider;
  } else {
    const res = await getStocksForMarket(market);
    stocks = res.stocks;
    provider =
      market === "US"
        ? statusFromResults(res, undefined)
        : statusFromResults(undefined, res);
  }

  const groups = aggregateGroups(stocks, market, group);

  return NextResponse.json({
    market,
    group,
    asOf: new Date().toISOString(),
    provider,
    groups,
    stocks,
  });
}
