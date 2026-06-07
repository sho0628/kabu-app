"use client";

import { useMemo } from "react";
import type { GroupBy, GroupStat, Stock } from "@/lib/types";
import { fmtMarketCap, fmtPct, heatColor } from "@/lib/format";

// Finviz風のヒートマップ。
// グループ(セクター大分類 or 業種細分類)ごとにブロックを並べ、
// 各銘柄タイルを時価総額に応じた大きさ・騰落率に応じた色で表示する。
export function SectorHeatmap({
  groups,
  stocks,
  level,
}: {
  groups: GroupStat[];
  stocks: Stock[];
  level: GroupBy;
}) {
  const grouped = useMemo(() => {
    const keyOf = (s: Stock) => (level === "industry" ? s.industry : s.sector);
    return groups.map((g) => {
      const members = stocks
        .filter((s) => keyOf(s) === g.name)
        .sort((a, b) => b.marketCap - a.marketCap);
      return { g, members };
    });
  }, [groups, stocks, level]);

  return (
    <div className="space-y-3">
      {grouped.map(({ g, members }) => {
        const cap = members.reduce((sum, s) => sum + s.marketCap, 0);
        return (
          <div
            key={`${g.name}-${g.market}`}
            className="rounded-lg border border-[var(--border)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface)]">
              <span className="font-semibold text-sm">
                {g.name}
                <span className="text-[var(--muted)] font-normal ml-2 text-xs">
                  {g.count}銘柄
                </span>
              </span>
              <span
                className="text-sm font-mono"
                style={{ color: upDown(g.avgChangePct) }}
              >
                {fmtPct(g.avgChangePct)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 p-1 bg-[var(--background)]">
              {members.map((s) => {
                const ratio = cap > 0 ? s.marketCap / cap : 0;
                const basis = 70 + ratio * 260;
                return (
                  <a
                    key={s.ticker}
                    href={`/stock/${encodeURIComponent(s.ticker)}`}
                    title={`${s.name} (${s.ticker})\n${s.industry}\n${fmtPct(
                      s.changePct
                    )} / 時価総額 ${fmtMarketCap(s.marketCap, s.market)}`}
                    className="flex flex-col justify-center items-center rounded px-2 py-3 text-center grow transition-transform hover:scale-[1.03]"
                    style={{
                      flexBasis: `${basis}px`,
                      backgroundColor: heatColor(s.changePct),
                    }}
                  >
                    <span className="font-bold text-xs text-white drop-shadow">
                      {s.ticker.replace(".T", "")}
                    </span>
                    <span className="text-[11px] font-mono text-white/90">
                      {fmtPct(s.changePct)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function upDown(pct: number): string {
  if (pct > 0) return "var(--up)";
  if (pct < 0) return "var(--down)";
  return "var(--muted)";
}
