import YahooFinance from "yahoo-finance2";
import type { Market, Sector, Stock } from "@/lib/types";

// =============================================================
// Yahoo Finance プロバイダ(米国株・日本株 両対応・無料・準リアルタイム)
// yahoo-finance2 を利用。APIキー不要。
// ⚠️ 非公式APIのため商用・大量アクセスは規約に注意。個人の分析用途を想定。
// =============================================================

// v3 はインスタンス方式。サーベイ通知と検証エラーログを抑制。
const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false },
});

// 取得対象ユニバース(無料・準リアルタイム。必要に応じて拡張)。
const US_UNIVERSE = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA",
  "JPM", "BAC", "BRK-B", "JNJ", "PFE", "UNH", "XOM", "CVX",
  "KO", "PG", "HD", "CAT", "BA", "T", "LIN", "NEE", "PLD", "INTC",
];

const JP_UNIVERSE = [
  "6758.T", "6861.T", "6098.T", "7203.T", "7267.T", "9983.T",
  "8306.T", "8316.T", "8766.T", "6501.T", "6981.T", "7011.T",
  "9984.T", "9432.T", "4502.T", "4503.T", "2914.T", "2502.T",
  "4063.T", "5401.T", "5020.T", "9501.T", "8801.T",
];

// Yahoo(英語GICS) → 当アプリのセクター区分
const SECTOR_MAP: Record<string, Sector> = {
  Technology: "情報技術",
  "Communication Services": "通信サービス",
  "Consumer Cyclical": "一般消費財",
  "Consumer Defensive": "生活必需品",
  Healthcare: "ヘルスケア",
  "Financial Services": "金融",
  Energy: "エネルギー",
  Industrials: "資本財",
  "Basic Materials": "素材",
  Utilities: "公益事業",
  "Real Estate": "不動産",
};

// 配当利回り・ROEは小数(0.03)で返る場合とパーセント(3.0)で返る場合がある。
// 1未満ならパーセントへ換算する。
function toPercent(v: number | null | undefined): number | null {
  if (v == null) return null;
  return v < 1 ? v * 100 : v;
}

async function fetchOne(symbol: string, market: Market): Promise<Stock | null> {
  try {
    const r = await yf.quoteSummary(symbol, {
      modules: [
        "price",
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
        "assetProfile",
      ],
    });

    const price = r.price;
    const detail = r.summaryDetail;
    const stats = r.defaultKeyStatistics;
    const fin = r.financialData;
    const profile = r.assetProfile;

    const current = price?.regularMarketPrice;
    if (current == null) return null;

    const sectorEn = profile?.sector ?? "";
    const sector = SECTOR_MAP[sectorEn] ?? "資本財";

    const per = detail?.trailingPE ?? stats?.forwardPE ?? null;
    const pbr = stats?.priceToBook ?? null;
    const div = toPercent(detail?.dividendYield ?? null);
    const roe = toPercent(fin?.returnOnEquity ?? null);

    return {
      ticker: symbol,
      name: price?.longName ?? price?.shortName ?? symbol,
      market,
      sector,
      price: current,
      // regularMarketChangePercent は既にパーセント値(例: 1.82 = +1.82%)
      changePct: round(price?.regularMarketChangePercent ?? 0, 2),
      volume: price?.regularMarketVolume ?? 0,
      // 時価総額を百万単位に揃える(現地通貨)
      marketCap: price?.marketCap ? price.marketCap / 1_000_000 : 0,
      per: typeof per === "number" ? round(per, 1) : null,
      pbr: typeof pbr === "number" ? round(pbr, 2) : null,
      dividendYield: div != null ? round(div, 2) : null,
      roe: roe != null ? round(roe, 1) : null,
    };
  } catch (err) {
    console.error(`[yahoo] ${symbol} 取得失敗:`, err);
    return null;
  }
}

function round(n: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export async function fetchYahooStocks(market: Market): Promise<Stock[]> {
  const universe = market === "US" ? US_UNIVERSE : JP_UNIVERSE;

  // 5銘柄ずつ並列に取得(過剰アクセスを避ける)。
  const results: Stock[] = [];
  for (let i = 0; i < universe.length; i += 5) {
    const batch = universe.slice(i, i + 5);
    const stocks = await Promise.all(batch.map((s) => fetchOne(s, market)));
    results.push(...stocks.filter((s): s is Stock => s !== null));
  }
  return results;
}
