import { NextResponse } from "next/server";
import type { Market } from "@/lib/types";
import {
  getAllStocks,
  getStocksForMarket,
  statusFromResults,
} from "@/lib/providers";
import { aggregateSectors } from "@/lib/sectors";

// セクター別の集計と構成銘柄を返す。
// GET /api/sectors?market=US|JP|ALL
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const marketParam = (searchParams.get("market") ?? "ALL").toUpperCase();
  const market: Market | "ALL" =
    marketParam === "US" || marketParam === "JP" ? (marketParam as Market) : "ALL";

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

  const sectors = aggregateSectors(stocks, market);

  return NextResponse.json({
    market,
    asOf: new Date().toISOString(),
    provider,
    sectors,
    stocks,
  });
}
