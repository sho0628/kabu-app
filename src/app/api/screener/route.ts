import { NextResponse } from "next/server";
import type { Market, ScreenerCriteria } from "@/lib/types";
import {
  getAllStocks,
  getStocksForMarket,
  statusFromResults,
} from "@/lib/providers";
import { DEFAULT_CRITERIA, screenStocks } from "@/lib/screener";

// バリュー株スクリーニング結果を返す。
// GET /api/screener?market=ALL&maxPer=15&maxPbr=1.5&minDividendYield=2.5&minRoe=8
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const marketParam = (searchParams.get("market") ?? "ALL").toUpperCase();
  const market: Market | "ALL" =
    marketParam === "US" || marketParam === "JP" ? (marketParam as Market) : "ALL";

  const num = (key: string, fallback: number) => {
    const raw = searchParams.get(key);
    const v = Number(raw);
    return raw !== null && Number.isFinite(v) ? v : fallback;
  };

  const criteria: ScreenerCriteria = {
    market,
    maxPer: num("maxPer", DEFAULT_CRITERIA.maxPer),
    maxPbr: num("maxPbr", DEFAULT_CRITERIA.maxPbr),
    minDividendYield: num("minDividendYield", DEFAULT_CRITERIA.minDividendYield),
    minRoe: num("minRoe", DEFAULT_CRITERIA.minRoe),
  };

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

  const results = screenStocks(stocks, criteria);

  return NextResponse.json({
    asOf: new Date().toISOString(),
    provider,
    criteria,
    count: results.length,
    results,
  });
}
