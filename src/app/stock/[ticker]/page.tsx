"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Stock } from "@/lib/types";
import type { PricePoint } from "@/lib/providers/yahoo";
import { LineChart } from "@/components/LineChart";
import { StarButton } from "@/lib/watchlist";
import { fmtMarketCap, fmtMultiple, fmtPct, fmtPrice, fmtVolume } from "@/lib/format";

interface DetailResponse {
  ticker: string;
  asOf: string;
  live: boolean;
  market: "US" | "JP";
  stock: Stock;
  history: PricePoint[];
}

export default function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const decoded = decodeURIComponent(ticker);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/stock/${encodeURIComponent(decoded)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json: DetailResponse = await r.json();
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
  }, [decoded]);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← セクターマップに戻る
      </Link>

      {loading && <div className="text-[var(--muted)] py-12 text-center">読み込み中…</div>}
      {error && (
        <div className="rounded-lg border border-[var(--down)] bg-[var(--down)]/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{data.stock.name}</h1>
                <StarButton ticker={data.stock.ticker} className="text-2xl" />
              </div>
              <p className="text-sm text-[var(--muted)] font-mono mt-1">
                {data.stock.ticker} · {data.market === "JP" ? "🇯🇵 日本株" : "🇺🇸 米国株"} ·{" "}
                {data.stock.sector} / {data.stock.industry}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono">
                {fmtPrice(data.stock.price, data.stock.market)}
              </div>
              <div
                className="text-sm font-mono"
                style={{ color: data.stock.changePct >= 0 ? "var(--up)" : "var(--down)" }}
              >
                {fmtPct(data.stock.changePct)}
              </div>
            </div>
          </div>

          {!data.live && (
            <div className="text-xs text-[var(--muted)]">
              ※ サンプル/擬似データを表示中（ライブ取得不可の環境）。株価推移はデモ用の擬似値です。
            </div>
          )}

          {/* 株価推移 */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold mb-2">株価推移（過去6か月・日足）</h2>
            <LineChart
              values={data.history.map((h) => h.close)}
              labels={[data.history[0]?.date ?? "", data.history.at(-1)?.date ?? ""]}
            />
          </section>

          {/* 主要指標 */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold mb-3">主要指標</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Metric label="PER（株価収益率）" value={fmtMultiple(data.stock.per)} />
              <Metric label="PBR（株価純資産倍率）" value={fmtMultiple(data.stock.pbr)} />
              <Metric label="配当利回り" value={fmtPct(data.stock.dividendYield, 1)} />
              <Metric label="ROE（自己資本利益率）" value={fmtPct(data.stock.roe, 1)} />
              <Metric label="時価総額" value={fmtMarketCap(data.stock.marketCap, data.stock.market)} />
              <Metric label="出来高" value={fmtVolume(data.stock.volume)} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="text-lg font-mono font-semibold mt-0.5">{value}</div>
    </div>
  );
}
