"use client";

import { useEffect, useState } from "react";
import type { ProviderStatus } from "@/lib/providers";
import type { SectorStat, Stock } from "@/lib/types";
import { MarketToggle, type MarketFilter } from "@/components/MarketToggle";
import { SectorHeatmap } from "@/components/SectorHeatmap";
import { fmtPct } from "@/lib/format";

interface SectorsResponse {
  market: MarketFilter;
  asOf: string;
  provider: ProviderStatus;
  sectors: SectorStat[];
  stocks: Stock[];
}

export default function DashboardPage() {
  const [market, setMarket] = useState<MarketFilter>("ALL");
  const [data, setData] = useState<SectorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/sectors?market=${market}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json: SectorsResponse = await r.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [market]);

  const maxScore =
    data?.sectors.reduce((m, s) => Math.max(m, Math.abs(s.moneyFlowScore)), 0) ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">セクター資金流入マップ</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            時価総額加重の騰落率と売買代金から、資金が集まっているセクターを可視化します。
          </p>
        </div>
        <MarketToggle value={market} onChange={setMarket} />
      </div>

      {data && (
        <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>
            データソース 🇺🇸 {data.provider.us} / 🇯🇵 {data.provider.jp}
          </span>
          <span>取得時刻 {new Date(data.asOf).toLocaleString("ja-JP")}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[var(--down)] bg-[var(--down)]/10 px-4 py-3 text-sm">
          データ取得に失敗しました: {error}
        </div>
      )}

      {loading && (
        <div className="text-[var(--muted)] py-12 text-center">読み込み中…</div>
      )}

      {!loading && data && (
        <>
          {/* 資金流入ランキング */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold mb-3">資金流入ランキング</h2>
            <div className="space-y-2">
              {data.sectors.map((s, i) => {
                const w = (Math.abs(s.moneyFlowScore) / maxScore) * 100;
                const positive = s.moneyFlowScore >= 0;
                return (
                  <div key={`${s.sector}-${i}`} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm">{s.sector}</span>
                    <div className="flex-1 h-5 bg-[var(--background)] rounded overflow-hidden relative">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${w}%`,
                          backgroundColor: positive ? "var(--up)" : "var(--down)",
                        }}
                      />
                    </div>
                    <span
                      className="w-20 shrink-0 text-right text-sm font-mono"
                      style={{ color: positive ? "var(--up)" : "var(--down)" }}
                    >
                      {fmtPct(s.avgChangePct)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ヒートマップ */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold">
                ヒートマップ(タイル=銘柄 / 大きさ=時価総額 / 色=騰落率)
              </h2>
              <Legend />
            </div>
            <SectorHeatmap sectors={data.sectors} stocks={data.stocks} />
          </section>
        </>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
      <span>下落</span>
      <div className="flex h-3 w-40 rounded overflow-hidden">
        <div className="flex-1" style={{ background: "rgba(234,57,67,0.85)" }} />
        <div className="flex-1" style={{ background: "rgba(234,57,67,0.35)" }} />
        <div className="flex-1" style={{ background: "rgba(139,152,169,0.3)" }} />
        <div className="flex-1" style={{ background: "rgba(22,199,132,0.35)" }} />
        <div className="flex-1" style={{ background: "rgba(22,199,132,0.85)" }} />
      </div>
      <span>上昇</span>
    </div>
  );
}
