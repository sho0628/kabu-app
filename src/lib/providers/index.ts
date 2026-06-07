import type { Market, Stock } from "@/lib/types";
import { SAMPLE_JP_STOCKS, SAMPLE_US_STOCKS } from "@/lib/data/sampleStocks";
import { fetchFinnhubStocks } from "./finnhub";
import { fetchJQuantsStocks } from "./jquants";
import { fetchYahooStocks } from "./yahoo";

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
      // デフォルト: Yahoo Finance
      const live = await fetchYahooStocks(market);
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
