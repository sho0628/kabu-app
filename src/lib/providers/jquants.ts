import type { Sector, Stock } from "@/lib/types";

// =============================================================
// J-Quants プロバイダ(日本株) — 無料枠: 12週間遅延 / 過去2年 / 5req/分
// 環境変数 JQUANTS_REFRESH_TOKEN が設定されている場合のみ呼ばれる。
// リフレッシュトークンは https://jpx-jquants.com のマイページで取得。
// https://jpx.gitbook.io/j-quants-ja
// =============================================================

const BASE = "https://api.jquants.com/v1";

// J-Quantsの17業種区分 → 当アプリのセクター区分への簡易マッピング。
const SECTOR_MAP: Record<string, Sector> = {
  情報通信: "通信サービス",
  "情報通信・サービスその他": "通信サービス",
  電気機器: "情報技術",
  機械: "資本財",
  自動車輸送機: "一般消費財",
  "自動車・輸送機": "一般消費財",
  小売: "一般消費財",
  銀行: "金融",
  金融: "金融",
  "金融(除く銀行)": "金融",
  医薬品: "ヘルスケア",
  食品: "生活必需品",
  エネルギー資源: "エネルギー",
  素材化学: "素材",
  "鉄鋼・非鉄": "素材",
  建設資材: "資本財",
  電力ガス: "公益事業",
  不動産: "不動産",
};

// アクセストークン(IDトークン)をリフレッシュトークンから取得。
async function getIdToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${BASE}/token/auth_refresh?refreshtoken=${refreshToken}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`J-Quants auth ${res.status}`);
  const json = (await res.json()) as { idToken: string };
  return json.idToken;
}

interface JQuantsListedInfo {
  Code: string;
  CompanyName: string;
  Sector17CodeName?: string;
  MarketCapitalization?: number;
}

interface JQuantsDailyQuote {
  Code: string;
  Close: number | null;
  Volume: number | null;
}

// 上場銘柄一覧を取得。
async function fetchListedInfo(idToken: string): Promise<JQuantsListedInfo[]> {
  const res = await fetch(`${BASE}/listed/info`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`J-Quants listed/info ${res.status}`);
  const json = (await res.json()) as { info: JQuantsListedInfo[] };
  return json.info;
}

export async function fetchJQuantsStocks(): Promise<Stock[]> {
  const refreshToken = process.env.JQUANTS_REFRESH_TOKEN;
  if (!refreshToken) return [];

  const idToken = await getIdToken(refreshToken);
  const listed = await fetchListedInfo(idToken);

  // 注意: 無料枠は財務指標(PER/PBR等)の一部に制約があり、
  // 全銘柄の値動き取得も5req/分の制限がある。
  // ここでは上場情報と直近の四本値を組み合わせる骨子のみ示す。
  // 実運用では取得結果をDBにキャッシュし、日次バッチで更新することを推奨。
  const stocks: Stock[] = [];
  for (const info of listed.slice(0, 30)) {
    try {
      const res = await fetch(`${BASE}/prices/daily_quotes?code=${info.Code}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { daily_quotes: JQuantsDailyQuote[] };
      const quotes = json.daily_quotes;
      if (quotes.length < 2) continue;

      const latest = quotes[quotes.length - 1];
      const prev = quotes[quotes.length - 2];
      const close = latest.Close ?? 0;
      const prevClose = prev.Close ?? close;
      const changePct = prevClose ? ((close - prevClose) / prevClose) * 100 : 0;

      stocks.push({
        ticker: `${info.Code}.T`,
        name: info.CompanyName,
        market: "JP",
        sector: SECTOR_MAP[info.Sector17CodeName ?? ""] ?? "資本財",
        // J-Quantsの17業種区分をそのまま細分類ラベルとして使用
        industry: info.Sector17CodeName ?? "その他",
        price: close,
        changePct,
        volume: latest.Volume ?? 0,
        marketCap: info.MarketCapitalization ? info.MarketCapitalization / 1_000_000 : 0,
        per: null, // 財務指標は /fins/statements から別途算出が必要
        pbr: null,
        dividendYield: null,
        roe: null,
      });

      await new Promise((r) => setTimeout(r, 13_000)); // 5req/分制限を尊重
    } catch (err) {
      console.error(`[jquants] ${info.Code} 取得失敗:`, err);
    }
  }
  return stocks;
}
