"use client";

import { useMemo } from "react";
import type { SectorStat, Stock } from "@/lib/types";
import { fmtMarketCap, fmtPct, heatColor } from "@/lib/format";

// Finviz風のヒートマップ。
// セクターごとにブロックを並べ、各銘柄タイルを時価総額に応じた大きさ・
// 騰落率に応じた色で表示する。
export function SectorHeatmap({
  sectors,
  stocks,
}: {
  sectors: SectorStat[];
  stocks: Stock[];
}) {
  // セクター順(資金流入スコア降順)に銘柄をまとめる
  const grouped = useMemo(() => {
    return sectors.map((sec) => {
      const members = stocks
        .filter((s) => s.sector === sec.sector)
        .sort((a, b) => b.marketCap - a.marketCap);
      return { sec, members };
    });
  }, [sectors, stocks]);

  return (
    <div className="space-y-3">
      {grouped.map(({ sec, members }) => {
        const secCap = members.reduce((sum, s) => sum + s.marketCap, 0);
        return (
          <div
            key={`${sec.sector}-${sec.market}`}
            className="rounded-lg border border-[var(--border)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface)]">
              <span className="font-semibold text-sm">{sec.sector}</span>
              <span
                className="text-sm font-mono"
                style={{ color: heatColorText(sec.avgChangePct) }}
              >
                {fmtPct(sec.avgChangePct)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 p-1 bg-[var(--background)]">
              {members.map((s) => {
                // 時価総額の比率でタイルの最小幅を変える(簡易treemap)
                const ratio = secCap > 0 ? s.marketCap / secCap : 0;
                const basis = 70 + ratio * 260; // px目安
                return (
                  <div
                    key={s.ticker}
                    title={`${s.name} (${s.ticker})\n${fmtPct(s.changePct)} / 時価総額 ${fmtMarketCap(
                      s.marketCap,
                      s.market
                    )}`}
                    className="flex flex-col justify-center items-center rounded px-2 py-3 text-center grow"
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
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function heatColorText(pct: number): string {
  if (pct > 0) return "var(--up)";
  if (pct < 0) return "var(--down)";
  return "var(--muted)";
}
