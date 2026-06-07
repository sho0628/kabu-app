"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Stock } from "@/lib/types";
import { useWatchlist, StarButton } from "@/lib/watchlist";
import { fmtMarketCap, fmtMultiple, fmtPct, fmtPrice } from "@/lib/format";

export default function WatchlistPage() {
  const { items } = useWatchlist();
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/sectors?market=ALL`);
        const json = await r.json();
        if (!cancelled) setAllStocks((json.stocks ?? []) as Stock[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = items
    .map((t) => allStocks.find((s) => s.ticker === t))
    .filter((s): s is Stock => Boolean(s));
  const missing = items.filter((t) => !allStocks.some((s) => s.ticker === t));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⭐ ウォッチリスト</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          気になる銘柄を保存できます（この端末のブラウザに保存）。
        </p>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
          まだ登録がありません。ヒートマップやスクリーナーの ☆ を押して追加してください。
        </div>
      )}

      {items.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface)] text-[var(--muted)] text-left">
                <th className="px-3 py-2 font-medium w-8"></th>
                <th className="px-3 py-2 font-medium">銘柄</th>
                <th className="px-3 py-2 font-medium text-right">株価</th>
                <th className="px-3 py-2 font-medium text-right">前日比</th>
                <th className="px-3 py-2 font-medium text-right">PER</th>
                <th className="px-3 py-2 font-medium text-right">PBR</th>
                <th className="px-3 py-2 font-medium text-right">配当</th>
                <th className="px-3 py-2 font-medium text-right">時価総額</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-[var(--muted)]">
                    読み込み中…
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((s) => (
                  <tr key={s.ticker} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                    <td className="px-3 py-2"><StarButton ticker={s.ticker} /></td>
                    <td className="px-3 py-2">
                      <Link href={`/stock/${encodeURIComponent(s.ticker)}`} className="hover:underline">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-[var(--muted)] text-xs font-mono">
                          {s.ticker} · {s.industry}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{fmtPrice(s.price, s.market)}</td>
                    <td className="px-3 py-2 text-right font-mono" style={{ color: s.changePct >= 0 ? "var(--up)" : "var(--down)" }}>
                      {fmtPct(s.changePct)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{fmtMultiple(s.per)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtMultiple(s.pbr)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtPct(s.dividendYield, 1)}</td>
                    <td className="px-3 py-2 text-right font-mono text-[var(--muted)]">{fmtMarketCap(s.marketCap, s.market)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      {!loading && missing.length > 0 && (
        <p className="text-xs text-[var(--muted)]">
          一覧データに無い銘柄: {missing.map((t) => (
            <Link key={t} href={`/stock/${encodeURIComponent(t)}`} className="underline mr-2">
              {t}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
