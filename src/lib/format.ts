import type { Market } from "@/lib/types";

// 騰落率の表示(符号付き・%)
export function fmtPct(v: number | null | undefined, digits = 2): string {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

// 倍率(PER/PBR)
export function fmtMultiple(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(v < 10 ? 2 : 1)}倍`;
}

// 価格(通貨記号付き)
export function fmtPrice(v: number, market: Market): string {
  const cur = market === "JP" ? "¥" : "$";
  return `${cur}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// 時価総額(百万単位 → 兆/億 などに丸める)
export function fmtMarketCap(millions: number, market: Market): string {
  const cur = market === "JP" ? "¥" : "$";
  if (market === "JP") {
    // 百万円 → 兆円/億円
    if (millions >= 1_000_000) return `${cur}${(millions / 1_000_000).toFixed(2)}兆`;
    if (millions >= 100) return `${cur}${(millions / 100).toFixed(0)}億`;
    return `${cur}${millions.toFixed(0)}百万`;
  }
  // 百万USD → B/M
  if (millions >= 1_000) return `${cur}${(millions / 1_000).toFixed(1)}B`;
  return `${cur}${millions.toFixed(0)}M`;
}

// 出来高の概数
export function fmtVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

// 騰落率に応じた背景色(緑=上昇 / 赤=下落、Finviz等の慣習)
export function changeColor(pct: number): string {
  if (pct > 0) return "var(--up)";
  if (pct < 0) return "var(--down)";
  return "var(--muted)";
}

// ヒートマップのタイル色(騰落率の強度で濃淡)
export function heatColor(pct: number): string {
  const clamped = Math.max(-4, Math.min(4, pct));
  const intensity = Math.abs(clamped) / 4; // 0..1
  const alpha = 0.15 + intensity * 0.75;
  if (clamped > 0) return `rgba(22, 199, 132, ${alpha})`;
  if (clamped < 0) return `rgba(234, 57, 67, ${alpha})`;
  return "rgba(139, 152, 169, 0.2)";
}
