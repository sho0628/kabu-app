"use client";

// 依存ライブラリなしのシンプルなSVG折れ線チャート。
// 株価推移・パフォーマンス推移の両方に利用。
export function LineChart({
  values,
  labels,
  height = 220,
  color,
  baselineZero = false,
}: {
  values: number[];
  labels?: string[]; // x軸ラベル(任意・端のみ表示)
  height?: number;
  color?: string; // 線色(未指定なら騰落で自動)
  baselineZero?: boolean; // 0%基準線を引く(パフォーマンス表示用)
}) {
  const W = 800;
  const H = height;
  const padX = 8;
  const padY = 12;

  if (!values || values.length < 2) {
    return (
      <div className="text-[var(--muted)] text-sm py-10 text-center">
        データがありません
      </div>
    );
  }

  const min = Math.min(...values, baselineZero ? 0 : Infinity);
  const max = Math.max(...values, baselineZero ? 0 : -Infinity);
  const range = max - min || 1;

  const x = (i: number) =>
    padX + (i / (values.length - 1)) * (W - padX * 2);
  const y = (v: number) =>
    padY + (1 - (v - min) / range) * (H - padY * 2);

  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(values.length - 1).toFixed(1)},${(H - padY).toFixed(
    1
  )} L${x(0).toFixed(1)},${(H - padY).toFixed(1)} Z`;

  const last = values[values.length - 1];
  const first = values[0];
  const lineColor = color ?? (last >= first ? "var(--up)" : "var(--down)");
  const zeroY = y(0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: H }}
    >
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {baselineZero && zeroY > padY && zeroY < H - padY && (
        <line
          x1={padX}
          x2={W - padX}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--muted)"
          strokeOpacity="0.4"
          strokeDasharray="4 4"
        />
      )}

      <path d={area} fill="url(#lc-fill)" />
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />

      {labels && labels.length >= 2 && (
        <>
          <text x={padX} y={H - 1} fontSize="11" fill="var(--muted)">
            {labels[0]}
          </text>
          <text x={W - padX} y={H - 1} fontSize="11" fill="var(--muted)" textAnchor="end">
            {labels[labels.length - 1]}
          </text>
        </>
      )}
    </svg>
  );
}
