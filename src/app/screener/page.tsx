"use client";

import { useEffect, useState } from "react";
import type { ProviderStatus } from "@/lib/providers";
import type { ScreenedStock, ScreenerCriteria } from "@/lib/types";
import Link from "next/link";
import { MarketToggle, type MarketFilter } from "@/components/MarketToggle";
import { StarButton } from "@/lib/watchlist";
import { fmtMarketCap, fmtMultiple, fmtPct, fmtPrice } from "@/lib/format";

interface ScreenerResponse {
  asOf: string;
  provider: ProviderStatus;
  criteria: ScreenerCriteria;
  count: number;
  results: ScreenedStock[];
}

const DEFAULTS = { maxPer: 15, maxPbr: 1.5, minDividendYield: 2.5, minRoe: 8 };

export default function ScreenerPage() {
  const [market, setMarket] = useState<MarketFilter>("ALL");
  const [maxPer, setMaxPer] = useState(DEFAULTS.maxPer);
  const [maxPbr, setMaxPbr] = useState(DEFAULTS.maxPbr);
  const [minDiv, setMinDiv] = useState(DEFAULTS.minDividendYield);
  const [minRoe, setMinRoe] = useState(DEFAULTS.minRoe);

  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        market,
        maxPer: String(maxPer),
        maxPbr: String(maxPbr),
        minDividendYield: String(minDiv),
        minRoe: String(minRoe),
      });
      try {
        const r = await fetch(`/api/screener?${params}`);
        const json: ScreenerResponse = await r.json();
        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [market, maxPer, maxPbr, minDiv, minRoe]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">バリュー株スクリーナー</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            低PER・低PBR・高配当・高ROE の条件で割安・優良株を自動抽出し、バリュースコア順に並べます。
          </p>
        </div>
        <MarketToggle value={market} onChange={setMarket} />
      </div>

      {/* 条件スライダー */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Slider label="PER 上限" value={maxPer} min={5} max={40} step={1} suffix="倍以下" onChange={setMaxPer} />
        <Slider label="PBR 上限" value={maxPbr} min={0.3} max={5} step={0.1} suffix="倍以下" onChange={setMaxPbr} />
        <Slider label="配当利回り 下限" value={minDiv} min={0} max={8} step={0.5} suffix="%以上" onChange={setMinDiv} />
        <Slider label="ROE 下限" value={minRoe} min={0} max={25} step={1} suffix="%以上" onChange={setMinRoe} />
      </section>

      {data && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span>
            該当 <span className="text-[var(--foreground)] font-semibold">{data.count}</span> 銘柄
          </span>
          <span>
            データソース 🇺🇸 {data.provider.us} / 🇯🇵 {data.provider.jp}
          </span>
        </div>
      )}

      {/* 結果テーブル */}
      <section className="rounded-lg border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface)] text-[var(--muted)] text-left">
              <th className="px-3 py-2 font-medium w-8"></th>
              <th className="px-3 py-2 font-medium">スコア</th>
              <th className="px-3 py-2 font-medium">銘柄</th>
              <th className="px-3 py-2 font-medium text-right">株価</th>
              <th className="px-3 py-2 font-medium text-right">前日比</th>
              <th className="px-3 py-2 font-medium text-right">PER</th>
              <th className="px-3 py-2 font-medium text-right">PBR</th>
              <th className="px-3 py-2 font-medium text-right">配当</th>
              <th className="px-3 py-2 font-medium text-right">ROE</th>
              <th className="px-3 py-2 font-medium text-right">時価総額</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-[var(--muted)]">
                  読み込み中…
                </td>
              </tr>
            )}
            {!loading && data?.results.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-[var(--muted)]">
                  条件に合う銘柄がありません。条件を緩めてみてください。
                </td>
              </tr>
            )}
            {!loading &&
              data?.results.map((s) => (
                <tr
                  key={s.ticker}
                  className="border-t border-[var(--border)] hover:bg-[var(--surface)]"
                >
                  <td className="px-3 py-2">
                    <StarButton ticker={s.ticker} />
                  </td>
                  <td className="px-3 py-2">
                    <ScoreBadge score={s.valueScore} />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/stock/${encodeURIComponent(s.ticker)}`}
                      className="hover:underline"
                    >
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-[var(--muted)] text-xs font-mono">
                        {s.ticker} · {s.industry}
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {fmtPrice(s.price, s.market)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono"
                    style={{ color: s.changePct >= 0 ? "var(--up)" : "var(--down)" }}
                  >
                    {fmtPct(s.changePct)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{fmtMultiple(s.per)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtMultiple(s.pbr)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtPct(s.dividendYield, 1)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtPct(s.roe, 1)}</td>
                  <td className="px-3 py-2 text-right font-mono text-[var(--muted)]">
                    {fmtMarketCap(s.marketCap, s.market)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        <span className="text-sm font-mono font-semibold">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </label>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "var(--up)" : score >= 50 ? "var(--accent)" : "var(--muted)";
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 text-right font-mono font-bold" style={{ color }}>
        {score}
      </div>
      <div className="w-12 h-1.5 bg-[var(--background)] rounded overflow-hidden">
        <div className="h-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
