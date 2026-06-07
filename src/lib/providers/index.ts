import { unstable_cache } from "next/cache";
import type { Market, Stock } from "@/lib/types";
import {
  SAMPLE_JP_STOCKS,
  SAMPLE_STOCKS,
  SAMPLE_US_STOCKS,
} from "@/lib/data/sampleStocks";
import { fetchFinnhubStocks } from "./finnhub";
import { fetchJQuantsStocks } from "./jquants";
import {
  fetchYahooDetail,
  fetchYahooStocks,
  inferMarket,
  type PricePoint,
  type StockDetail,
} from "./yahoo";

// ライブ取得を5分キャッシュ(銘柄増加に伴うAPI負荷軽減・高速化)。
// 市場ごとにキー分割。revalidate 経過後の初回リクエストで再取得。
const cachedYahoo = unstable_cache(
  async (market: Market) => fetchYahooStocks(market),
  ["yahoo-stocks"],
  { revalidate: 300, tags: ["stocks"] }
);

// 個別銘柄の詳細を5分キャッシュ。
const cachedDetail = unstable_cache(
  async (ticker: string) => fetchYahooDetail(ticker),
  ["yahoo-detail"],
  { revalidate: 300, tags: ["detail"] }
);

// データソースの選択。
// - "yahoo"  : 無料・準リアルタイム・両市場対応(デフォルト)
// - "sample" : サンプルデータのみ(オフライン/デモ用)
// - "vendor" : 米国=Finnhub / 日本=J-Quants(各APIキーが必要)
const DATA_SOURCE = (process.env.DATA_SOURCE ?? "yahoo").toLowerCase();

// データ取得プロバイダの共通インターフェース。
export interface DataProvider {
  name: string;
  getStocks(market: Market): Promise<Stock[]>;
}

// 1市場分の取得結果(実際に使われたソースを保持)。
export interface MarketResult {
  stocks: Stock[];
  source: string; // 実際に使ったソース名(UI表示用)
  live: boolean; // ライブ取得に成功したか
}

// 全市場分のソース状況(UI表示用)。
export interface ProviderStatus {
  us: string;
  jp: string;
  usLive: boolean;
  jpLive: boolean;
}

function sampleFor(market: Market): Stock[] {
  return market === "US" ? SAMPLE_US_STOCKS : SAMPLE_JP_STOCKS;
}

// 単一市場の銘柄を取得。
// 選択中のデータソースで取得し、失敗時はサンプルにフォールバック。
// 戻り値には「実際に使われたソース」を含める(表示の正直さのため)。
export async function getStocksForMarket(market: Market): Promise<MarketResult> {
  if (DATA_SOURCE === "sample") {
    return { stocks: sampleFor(market), source: "サンプルデータ", live: false };
  }

  try {
    if (DATA_SOURCE === "vendor") {
      if (market === "US" && process.env.FINNHUB_API_KEY) {
        const live = await fetchFinnhubStocks();
        if (live.length > 0) return { stocks: live, source: "Finnhub", live: true };
      } else if (market === "JP" && process.env.JQUANTS_REFRESH_TOKEN) {
        const live = await fetchJQuantsStocks();
        if (live.length > 0) return { stocks: live, source: "J-Quants", live: true };
      }
    } else {
      // デフォルト: Yahoo Finance(5分キャッシュ)
      const live = await cachedYahoo(market);
      if (live.length > 0)
        return { stocks: live, source: "Yahoo Finance (準リアルタイム)", live: true };
    }
  } catch (err) {
    console.error(`[provider] ${market} ライブ取得失敗。サンプルにフォールバック:`, err);
  }

  return {
    stocks: sampleFor(market),
    source: "サンプル(フォールバック)",
    live: false,
  };
}

// 全市場の銘柄を取得し、ソース状況も返す。
export async function getAllStocks(): Promise<{
  stocks: Stock[];
  provider: ProviderStatus;
}> {
  const [us, jp] = await Promise.all([
    getStocksForMarket("US"),
    getStocksForMarket("JP"),
  ]);
  return {
    stocks: [...us.stocks, ...jp.stocks],
    provider: { us: us.source, jp: jp.source, usLive: us.live, jpLive: jp.live },
  };
}

// 個別銘柄の詳細(財務 + 株価推移)を取得。
// ライブ失敗・サンプルモード時はサンプル銘柄 + 擬似履歴を返す。
export async function getStockDetail(ticker: string): Promise<
  StockDetail & { live: boolean; market: Market }
> {
  const market = inferMarket(ticker);

  if (DATA_SOURCE !== "sample") {
    try {
      const d = await cachedDetail(ticker);
      if (d.stock) return { ...d, live: true, market };
    } catch (err) {
      console.error(`[provider] ${ticker} 詳細取得失敗。サンプルへ:`, err);
    }
  }

  const sample = SAMPLE_STOCKS.find((s) => s.ticker === ticker) ?? null;
  return {
    stock: sample,
    history: sample ? synthHistory(sample.price) : [],
    live: false,
    market,
  };
}

// サンプル/フォールバック時の擬似株価推移(現在値に着地する決定論的ランダムウォーク)。
function synthHistory(current: number): PricePoint[] {
  const days = 126; // 約6か月の営業日
  const points: PricePoint[] = [];
  let v = current * 0.85;
  let seed = Math.round(current * 100);
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff - 0.5;
  };
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // 現在値へ収束させつつ揺らぎを加える
    const drift = (current - v) * 0.05;
    v = Math.max(0.01, v + drift + v * rand() * 0.02);
    points.push({ date: d.toISOString().slice(0, 10), close: Math.round(v * 100) / 100 });
  }
  if (points.length) points[points.length - 1].close = current;
  return points;
}

// 単一市場用のProviderStatusを組み立てる。
export function statusFromResults(
  us?: MarketResult,
  jp?: MarketResult
): ProviderStatus {
  return {
    us: us?.source ?? "—",
    jp: jp?.source ?? "—",
    usLive: us?.live ?? false,
    jpLive: jp?.live ?? false,
  };
}
