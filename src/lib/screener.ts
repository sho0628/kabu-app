import type { ScreenedStock, ScreenerCriteria, Stock } from "@/lib/types";

// バリュー株スクリーニングのデフォルト条件(割安・優良の目安)
export const DEFAULT_CRITERIA: ScreenerCriteria = {
  market: "ALL",
  maxPer: 15, // PER 15倍以下 = 割安の目安
  maxPbr: 1.5, // PBR 1.5倍以下 = 純資産に対して割安
  minDividendYield: 2.5, // 配当利回り 2.5%以上
  minRoe: 8, // ROE 8%以上 = 一定の収益性
};

// 各指標を0-100に正規化してバリュースコアを算出する。
// 低PER・低PBR・高配当・高ROE ほど高スコア。
function computeValueScore(s: Stock): number {
  // PER: 低いほど良い。5倍=満点、25倍=0点。
  const perScore = s.per != null && s.per > 0 ? clamp((25 - s.per) / 20) : 0;
  // PBR: 低いほど良い。0.5倍=満点、3倍=0点。
  const pbrScore = s.pbr != null && s.pbr > 0 ? clamp((3 - s.pbr) / 2.5) : 0;
  // 配当利回り: 高いほど良い。6%=満点、0%=0点。
  const divScore = s.dividendYield != null ? clamp(s.dividendYield / 6) : 0;
  // ROE: 高いほど良い。20%=満点、0%=0点。
  const roeScore = s.roe != null && s.roe > 0 ? clamp(s.roe / 20) : 0;

  // 重み付け: バリュー(PER/PBR)を重視しつつ、配当と質(ROE)も加味。
  const weighted =
    perScore * 0.3 + pbrScore * 0.3 + divScore * 0.2 + roeScore * 0.2;
  return Math.round(weighted * 100);
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// 条件でフィルタし、バリュースコア降順で返す。
export function screenStocks(
  stocks: Stock[],
  criteria: ScreenerCriteria
): ScreenedStock[] {
  const filtered = stocks.filter((s) => {
    if (criteria.market !== "ALL" && s.market !== criteria.market) return false;
    // 指標が欠損(null)の銘柄は条件未達として除外(赤字企業など)。
    if (s.per == null || s.per <= 0 || s.per > criteria.maxPer) return false;
    if (s.pbr == null || s.pbr <= 0 || s.pbr > criteria.maxPbr) return false;
    if (s.dividendYield == null || s.dividendYield < criteria.minDividendYield)
      return false;
    if (s.roe == null || s.roe < criteria.minRoe) return false;
    return true;
  });

  return filtered
    .map((s) => ({ ...s, valueScore: computeValueScore(s) }))
    .sort((a, b) => b.valueScore - a.valueScore);
}
