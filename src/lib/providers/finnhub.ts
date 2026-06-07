import type { Sector, Stock } from "@/lib/types";

// =============================================================
// Finnhub プロバイダ(米国株) — 無料枠: 60リクエスト/分
// 環境変数 FINNHUB_API_KEY が設定されている場合のみ呼ばれる。
// https://finnhub.io/docs/api
// =============================================================

// 取得対象の米国株ユニバース(無料枠を考慮し主要銘柄に限定)。
// 必要に応じて拡張、または S&P500 構成銘柄リストを読み込む。
const US_UNIVERSE = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA",
  "JPM", "BAC", "JNJ", "PFE", "UNH", "XOM", "CVX",
  "KO", "PG", "HD", "CAT", "BA", "T", "LIN", "NEE", "PLD",
];

// FinnhubのGICS業種 → 当アプリのセクター区分へのマッピング。
const SECTOR_MAP: Record<string, Sector> = {
  Technology: "情報技術",
  "Communication Services": "通信サービス",
  "Consumer Cyclical": "一般消費財",
  "Consumer Discretionary": "一般消費財",
  "Consumer Defensive": "生活必需品",
  "Consumer Staples": "生活必需品",
  Healthcare: "ヘルスケア",
  "Financial Services": "金融",
  Financials: "金融",
  Energy: "エネルギー",
  Industrials: "資本財",
  "Basic Materials": "素材",
  Materials: "素材",
  Utilities: "公益事業",
  "Real Estate": "不動産",
};

const BASE = "https://finnhub.io/api/v1";

interface FinnhubQuote {
  c: number; // 現在値
  dp: number; // 前日比(%)
}

interface FinnhubProfile {
  finnhubIndustry?: string;
  marketCapitalization?: number; // 百万USD
  name?: string;
}

interface FinnhubMetricResponse {
  metric?: {
    peTTM?: number;
    pbAnnual?: number;
    dividendYieldIndicatedAnnual?: number;
    roeTTM?: number;
    "10DayAverageTradingVolume"?: number;
  };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function fetchOne(symbol: string, token: string): Promise<Stock | null> {
  try {
    const [quote, profile, metrics] = await Promise.all([
      getJson<FinnhubQuote>(`${BASE}/quote?symbol=${symbol}&token=${token}`),
      getJson<FinnhubProfile>(`${BASE}/stock/profile2?symbol=${symbol}&token=${token}`),
      getJson<FinnhubMetricResponse>(`${BASE}/stock/metric?symbol=${symbol}&metric=all&token=${token}`),
    ]);

    const m = metrics.metric ?? {};
    const sector = SECTOR_MAP[profile.finnhubIndustry ?? ""] ?? "情報技術";

    return {
      ticker: symbol,
      name: profile.name ?? symbol,
      market: "US",
      sector,
      price: quote.c,
      changePct: quote.dp ?? 0,
      volume: Math.round((m["10DayAverageTradingVolume"] ?? 0) * 1_000_000),
      marketCap: profile.marketCapitalization ?? 0,
      per: m.peTTM ?? null,
      pbr: m.pbAnnual ?? null,
      dividendYield: m.dividendYieldIndicatedAnnual ?? null,
      roe: m.roeTTM ?? null,
    };
  } catch (err) {
    console.error(`[finnhub] ${symbol} 取得失敗:`, err);
    return null;
  }
}

export async function fetchFinnhubStocks(): Promise<Stock[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return [];

  // 無料枠(60req/分)を尊重し、3銘柄ずつ直列に処理(1銘柄=3リクエスト)。
  const results: Stock[] = [];
  for (let i = 0; i < US_UNIVERSE.length; i += 3) {
    const batch = US_UNIVERSE.slice(i, i + 3);
    const stocks = await Promise.all(batch.map((s) => fetchOne(s, token)));
    results.push(...stocks.filter((s): s is Stock => s !== null));
    if (i + 3 < US_UNIVERSE.length) await new Promise((r) => setTimeout(r, 1500));
  }
  return results;
}
