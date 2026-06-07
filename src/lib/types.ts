// 市場区分
export type Market = "US" | "JP";

// セクター(GICS準拠の11セクターに簡略化)
export type Sector =
  | "情報技術"
  | "ヘルスケア"
  | "金融"
  | "一般消費財"
  | "生活必需品"
  | "通信サービス"
  | "資本財"
  | "エネルギー"
  | "素材"
  | "公益事業"
  | "不動産";

export const ALL_SECTORS: Sector[] = [
  "情報技術",
  "ヘルスケア",
  "金融",
  "一般消費財",
  "生活必需品",
  "通信サービス",
  "資本財",
  "エネルギー",
  "素材",
  "公益事業",
  "不動産",
];

// 個別銘柄
export interface Stock {
  ticker: string; // 例: AAPL, 7203.T
  name: string;
  market: Market;
  sector: Sector; // 大分類(GICS 11セクター)
  industry: string; // 細分類(業種・日本語ラベル)
  price: number; // 現在値(現地通貨)
  changePct: number; // 前日比(%)
  volume: number; // 出来高(株)
  marketCap: number; // 時価総額(百万・現地通貨)
  per: number | null; // PER(株価収益率)
  pbr: number | null; // PBR(株価純資産倍率)
  dividendYield: number | null; // 配当利回り(%)
  roe: number | null; // 自己資本利益率(%)
}

// 集計の粒度(大分類セクター or 細分類業種)
export type GroupBy = "sector" | "industry";

// グループ集計(セクター/業種共通)
export interface GroupStat {
  name: string; // グループ名(セクター名 or 業種名)
  level: GroupBy; // 集計粒度
  market: Market | "ALL";
  avgChangePct: number; // 時価総額加重の平均騰落率(%)
  totalMarketCap: number; // 合計時価総額(百万)
  totalVolume: number; // 合計出来高
  count: number; // 構成銘柄数
  moneyFlowScore: number; // 資金流入スコア
}

// バリュー株スクリーニング条件
export interface ScreenerCriteria {
  market: Market | "ALL";
  maxPer: number;
  maxPbr: number;
  minDividendYield: number;
  minRoe: number;
}

// スクリーニング結果(スコア付き)
export interface ScreenedStock extends Stock {
  valueScore: number; // 0-100。高いほど割安・優良
}
