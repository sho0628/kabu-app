"use client";

import { useCallback, useEffect, useState } from "react";

// ウォッチリストはブラウザの localStorage に保存(バックエンド不要)。
// 複数コンポーネント間の同期は CustomEvent で行う。
const KEY = "kabu:watchlist";
const EVT = "kabu:watchlist-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync(); // 初回読み込み
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync); // 別タブとの同期
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback((ticker: string) => items.includes(ticker), [items]);

  const toggle = useCallback((ticker: string) => {
    const cur = read();
    const next = cur.includes(ticker)
      ? cur.filter((t) => t !== ticker)
      : [...cur, ticker];
    write(next);
  }, []);

  const remove = useCallback((ticker: string) => {
    write(read().filter((t) => t !== ticker));
  }, []);

  return { items, has, toggle, remove };
}

// 一覧表示などで使う星ボタン。
export function StarButton({
  ticker,
  className = "",
}: {
  ticker: string;
  className?: string;
}) {
  const { has, toggle } = useWatchlist();
  const active = has(ticker);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(ticker);
      }}
      title={active ? "ウォッチリストから削除" : "ウォッチリストに追加"}
      aria-label={active ? "ウォッチリストから削除" : "ウォッチリストに追加"}
      className={`text-lg leading-none transition-colors ${
        active ? "text-yellow-400" : "text-[var(--muted)] hover:text-yellow-400"
      } ${className}`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
