import type { GroupBy, GroupStat, Market, Stock } from "@/lib/types";

// 銘柄群を指定の粒度(セクター大分類 or 業種細分類)で集計する。
// - avgChangePct: 時価総額加重の平均騰落率(グループの値動き)
// - tradedValue 相当: price × volume の合計(売買代金 = 資金の動きの代理指標)
// - moneyFlowScore: 騰落率と売買代金回転率を掛け合わせた資金流入スコア
export function aggregateGroups(
  stocks: Stock[],
  market: Market | "ALL",
  level: GroupBy = "sector"
): GroupStat[] {
  const filtered =
    market === "ALL" ? stocks : stocks.filter((s) => s.market === market);

  const keyOf = (s: Stock) => (level === "industry" ? s.industry : s.sector);

  const groups = new Map<string, Stock[]>();
  for (const s of filtered) {
    const k = keyOf(s);
    const arr = groups.get(k) ?? [];
    arr.push(s);
    groups.set(k, arr);
  }

  const stats: GroupStat[] = [];
  for (const [name, members] of groups) {
    const totalMarketCap = members.reduce((sum, s) => sum + s.marketCap, 0);
    const totalVolume = members.reduce((sum, s) => sum + s.volume, 0);

    // 時価総額加重の平均騰落率
    const avgChangePct =
      totalMarketCap > 0
        ? members.reduce((sum, s) => sum + s.changePct * s.marketCap, 0) /
          totalMarketCap
        : members.reduce((sum, s) => sum + s.changePct, 0) / members.length;

    // 売買代金(=資金の流れの大きさ)と回転率(売買代金/時価総額)
    const tradedValue = members.reduce((sum, s) => sum + s.price * s.volume, 0);
    const turnover =
      totalMarketCap > 0 ? tradedValue / (totalMarketCap * 1_000_000) : 0;

    // 資金流入スコア: 値上がり × 活発さ。プラスほど資金流入の傾向。
    const moneyFlowScore = avgChangePct * (1 + Math.min(turnover, 1));

    stats.push({
      name,
      level,
      market,
      avgChangePct: round(avgChangePct, 2),
      totalMarketCap,
      totalVolume,
      count: members.length,
      moneyFlowScore: round(moneyFlowScore, 2),
    });
  }

  // 資金流入スコアの降順(資金が集まっているグループが上)
  return stats.sort((a, b) => b.moneyFlowScore - a.moneyFlowScore);
}

function round(n: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}
