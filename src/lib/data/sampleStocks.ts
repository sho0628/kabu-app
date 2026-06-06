import type { Stock } from "@/lib/types";

// =============================================================
// サンプルデータ
// APIキー未設定でもアプリが動作するためのダミーデータ。
// 数値は実在企業に概ね沿うが、あくまでサンプル(実データではない)。
// 本番では providers/finnhub.ts・jquants.ts が取得したデータに差し替わる。
// =============================================================

export const SAMPLE_US_STOCKS: Stock[] = [
  // 情報技術
  { ticker: "AAPL", name: "Apple", market: "US", sector: "情報技術", price: 212.4, changePct: 1.8, volume: 54_200_000, marketCap: 3_250_000, per: 33.1, pbr: 48.2, dividendYield: 0.5, roe: 147.0 },
  { ticker: "MSFT", name: "Microsoft", market: "US", sector: "情報技術", price: 448.3, changePct: 2.4, volume: 21_800_000, marketCap: 3_330_000, per: 37.5, pbr: 12.1, dividendYield: 0.7, roe: 38.5 },
  { ticker: "NVDA", name: "NVIDIA", market: "US", sector: "情報技術", price: 131.2, changePct: 3.9, volume: 312_000_000, marketCap: 3_220_000, per: 62.0, pbr: 49.0, dividendYield: 0.03, roe: 115.0 },
  { ticker: "INTC", name: "Intel", market: "US", sector: "情報技術", price: 21.8, changePct: -1.2, volume: 48_000_000, marketCap: 93_000, per: null, pbr: 0.9, dividendYield: 0.0, roe: -4.5 },
  // 通信サービス
  { ticker: "GOOGL", name: "Alphabet", market: "US", sector: "通信サービス", price: 178.6, changePct: 1.1, volume: 24_000_000, marketCap: 2_180_000, per: 25.8, pbr: 6.9, dividendYield: 0.4, roe: 30.8 },
  { ticker: "META", name: "Meta Platforms", market: "US", sector: "通信サービス", price: 503.1, changePct: 2.0, volume: 13_500_000, marketCap: 1_280_000, per: 27.4, pbr: 8.1, dividendYield: 0.4, roe: 33.4 },
  { ticker: "T", name: "AT&T", market: "US", sector: "通信サービス", price: 19.4, changePct: -0.3, volume: 31_000_000, marketCap: 139_000, per: 9.8, pbr: 1.3, dividendYield: 5.7, roe: 13.2 },
  // 一般消費財
  { ticker: "AMZN", name: "Amazon", market: "US", sector: "一般消費財", price: 186.5, changePct: 1.5, volume: 38_000_000, marketCap: 1_940_000, per: 44.0, pbr: 8.3, dividendYield: 0.0, roe: 20.1 },
  { ticker: "TSLA", name: "Tesla", market: "US", sector: "一般消費財", price: 248.9, changePct: -2.8, volume: 96_000_000, marketCap: 793_000, per: 70.5, pbr: 11.2, dividendYield: 0.0, roe: 16.0 },
  { ticker: "HD", name: "Home Depot", market: "US", sector: "一般消費財", price: 342.7, changePct: 0.6, volume: 3_200_000, marketCap: 340_000, per: 23.6, pbr: 55.0, dividendYield: 2.6, roe: 380.0 },
  // 金融
  { ticker: "JPM", name: "JPMorgan Chase", market: "US", sector: "金融", price: 198.4, changePct: 0.9, volume: 9_100_000, marketCap: 567_000, per: 12.1, pbr: 1.9, dividendYield: 2.3, roe: 16.8 },
  { ticker: "BAC", name: "Bank of America", market: "US", sector: "金融", price: 39.8, changePct: 1.3, volume: 38_000_000, marketCap: 308_000, per: 13.4, pbr: 1.1, dividendYield: 2.6, roe: 9.4 },
  { ticker: "BRK.B", name: "Berkshire Hathaway", market: "US", sector: "金融", price: 411.2, changePct: 0.4, volume: 3_500_000, marketCap: 890_000, per: 9.2, pbr: 1.5, dividendYield: 0.0, roe: 17.3 },
  // ヘルスケア
  { ticker: "JNJ", name: "Johnson & Johnson", market: "US", sector: "ヘルスケア", price: 147.3, changePct: -0.5, volume: 7_000_000, marketCap: 355_000, per: 14.5, pbr: 5.2, dividendYield: 3.4, roe: 23.0 },
  { ticker: "PFE", name: "Pfizer", market: "US", sector: "ヘルスケア", price: 28.1, changePct: -1.1, volume: 30_000_000, marketCap: 159_000, per: 11.2, pbr: 1.6, dividendYield: 5.9, roe: 9.0 },
  { ticker: "UNH", name: "UnitedHealth", market: "US", sector: "ヘルスケア", price: 492.0, changePct: 0.8, volume: 3_000_000, marketCap: 452_000, per: 18.0, pbr: 4.8, dividendYield: 1.7, roe: 26.5 },
  // 生活必需品
  { ticker: "KO", name: "Coca-Cola", market: "US", sector: "生活必需品", price: 63.4, changePct: 0.2, volume: 13_000_000, marketCap: 273_000, per: 24.8, pbr: 10.5, dividendYield: 3.1, roe: 41.0 },
  { ticker: "PG", name: "Procter & Gamble", market: "US", sector: "生活必需品", price: 167.9, changePct: 0.5, volume: 6_000_000, marketCap: 395_000, per: 26.5, pbr: 7.8, dividendYield: 2.4, roe: 30.0 },
  // エネルギー
  { ticker: "XOM", name: "Exxon Mobil", market: "US", sector: "エネルギー", price: 114.2, changePct: 2.7, volume: 16_000_000, marketCap: 508_000, per: 13.8, pbr: 2.0, dividendYield: 3.3, roe: 15.2 },
  { ticker: "CVX", name: "Chevron", market: "US", sector: "エネルギー", price: 156.8, changePct: 2.1, volume: 8_000_000, marketCap: 288_000, per: 14.2, pbr: 1.8, dividendYield: 4.1, roe: 13.0 },
  // 資本財
  { ticker: "CAT", name: "Caterpillar", market: "US", sector: "資本財", price: 334.5, changePct: 1.0, volume: 3_200_000, marketCap: 162_000, per: 16.3, pbr: 8.9, dividendYield: 1.7, roe: 53.0 },
  { ticker: "BA", name: "Boeing", market: "US", sector: "資本財", price: 178.2, changePct: -1.7, volume: 6_500_000, marketCap: 109_000, per: null, pbr: null, dividendYield: 0.0, roe: -25.0 },
  // 素材
  { ticker: "LIN", name: "Linde", market: "US", sector: "素材", price: 462.1, changePct: 0.7, volume: 1_400_000, marketCap: 221_000, per: 32.0, pbr: 5.5, dividendYield: 1.2, roe: 17.5 },
  // 公益事業
  { ticker: "NEE", name: "NextEra Energy", market: "US", sector: "公益事業", price: 73.5, changePct: -0.6, volume: 9_000_000, marketCap: 151_000, per: 22.0, pbr: 3.1, dividendYield: 2.9, roe: 11.5 },
  // 不動産
  { ticker: "PLD", name: "Prologis", market: "US", sector: "不動産", price: 110.3, changePct: -0.9, volume: 4_000_000, marketCap: 102_000, per: 38.0, pbr: 1.9, dividendYield: 3.5, roe: 5.5 },
];

export const SAMPLE_JP_STOCKS: Stock[] = [
  // 情報技術
  { ticker: "6758.T", name: "ソニーグループ", market: "JP", sector: "情報技術", price: 3120, changePct: 1.4, volume: 8_500_000, marketCap: 19_400_000, per: 19.2, pbr: 2.4, dividendYield: 0.6, roe: 13.0 },
  { ticker: "6861.T", name: "キーエンス", market: "JP", sector: "情報技術", price: 62_300, changePct: 0.8, volume: 320_000, marketCap: 15_100_000, per: 38.0, pbr: 5.1, dividendYield: 0.5, roe: 14.5 },
  { ticker: "6098.T", name: "リクルートHD", market: "JP", sector: "情報技術", price: 9_850, changePct: 2.1, volume: 4_200_000, marketCap: 15_000_000, per: 33.5, pbr: 6.0, dividendYield: 0.5, roe: 18.0 },
  // 一般消費財
  { ticker: "7203.T", name: "トヨタ自動車", market: "JP", sector: "一般消費財", price: 2_780, changePct: 1.1, volume: 32_000_000, marketCap: 45_300_000, per: 9.5, pbr: 1.1, dividendYield: 2.8, roe: 12.5 },
  { ticker: "7267.T", name: "ホンダ", market: "JP", sector: "一般消費財", price: 1_510, changePct: 0.6, volume: 18_000_000, marketCap: 8_100_000, per: 7.2, pbr: 0.6, dividendYield: 4.2, roe: 9.0 },
  { ticker: "9983.T", name: "ファーストリテイリング", market: "JP", sector: "一般消費財", price: 48_200, changePct: -0.4, volume: 900_000, marketCap: 15_300_000, per: 40.0, pbr: 7.8, dividendYield: 0.7, roe: 20.0 },
  // 金融
  { ticker: "8306.T", name: "三菱UFJ FG", market: "JP", sector: "金融", price: 1_720, changePct: 2.3, volume: 60_000_000, marketCap: 21_500_000, per: 11.0, pbr: 0.9, dividendYield: 3.1, roe: 8.5 },
  { ticker: "8316.T", name: "三井住友FG", market: "JP", sector: "金融", price: 3_640, changePct: 1.9, volume: 14_000_000, marketCap: 11_900_000, per: 12.5, pbr: 0.8, dividendYield: 3.3, roe: 7.8 },
  { ticker: "8766.T", name: "東京海上HD", market: "JP", sector: "金融", price: 5_780, changePct: 1.2, volume: 5_000_000, marketCap: 11_300_000, per: 15.0, pbr: 1.9, dividendYield: 2.6, roe: 14.0 },
  // 資本財
  { ticker: "6501.T", name: "日立製作所", market: "JP", sector: "資本財", price: 3_850, changePct: 2.6, volume: 12_000_000, marketCap: 17_800_000, per: 18.0, pbr: 2.2, dividendYield: 1.3, roe: 13.5 },
  { ticker: "6981.T", name: "村田製作所", market: "JP", sector: "資本財", price: 2_950, changePct: 1.5, volume: 7_000_000, marketCap: 6_000_000, per: 22.0, pbr: 1.7, dividendYield: 1.6, roe: 8.0 },
  { ticker: "7011.T", name: "三菱重工業", market: "JP", sector: "資本財", price: 2_240, changePct: 3.2, volume: 40_000_000, marketCap: 7_550_000, per: 28.0, pbr: 3.0, dividendYield: 1.1, roe: 11.0 },
  // 通信サービス
  { ticker: "9984.T", name: "ソフトバンクグループ", market: "JP", sector: "通信サービス", price: 9_650, changePct: 1.7, volume: 11_000_000, marketCap: 14_200_000, per: null, pbr: 1.8, dividendYield: 0.4, roe: -2.0 },
  { ticker: "9432.T", name: "日本電信電話(NTT)", market: "JP", sector: "通信サービス", price: 152, changePct: -0.7, volume: 90_000_000, marketCap: 13_700_000, per: 11.5, pbr: 1.3, dividendYield: 3.4, roe: 11.0 },
  // ヘルスケア
  { ticker: "4502.T", name: "武田薬品工業", market: "JP", sector: "ヘルスケア", price: 4_180, changePct: -0.3, volume: 6_500_000, marketCap: 6_600_000, per: 25.0, pbr: 1.0, dividendYield: 4.6, roe: 4.0 },
  { ticker: "4503.T", name: "アステラス製薬", market: "JP", sector: "ヘルスケア", price: 1_580, changePct: -1.0, volume: 14_000_000, marketCap: 2_900_000, per: 30.0, pbr: 1.4, dividendYield: 4.0, roe: 5.0 },
  // 生活必需品
  { ticker: "2914.T", name: "日本たばこ産業(JT)", market: "JP", sector: "生活必需品", price: 4_320, changePct: 0.5, volume: 5_000_000, marketCap: 8_600_000, per: 14.0, pbr: 1.9, dividendYield: 4.8, roe: 13.5 },
  { ticker: "2502.T", name: "アサヒグループHD", market: "JP", sector: "生活必需品", price: 1_810, changePct: 0.1, volume: 4_000_000, marketCap: 2_600_000, per: 13.0, pbr: 1.2, dividendYield: 2.8, roe: 9.5 },
  // 素材
  { ticker: "4063.T", name: "信越化学工業", market: "JP", sector: "素材", price: 5_900, changePct: 1.0, volume: 6_000_000, marketCap: 11_700_000, per: 19.0, pbr: 2.0, dividendYield: 1.7, roe: 11.0 },
  { ticker: "5401.T", name: "日本製鉄", market: "JP", sector: "素材", price: 3_100, changePct: 2.0, volume: 9_000_000, marketCap: 2_900_000, per: 8.0, pbr: 0.7, dividendYield: 5.0, roe: 9.0 },
  // エネルギー
  { ticker: "5020.T", name: "ENEOSホールディングス", market: "JP", sector: "エネルギー", price: 780, changePct: 1.8, volume: 20_000_000, marketCap: 2_300_000, per: 9.0, pbr: 0.7, dividendYield: 3.5, roe: 8.0 },
  // 公益事業
  { ticker: "9501.T", name: "東京電力HD", market: "JP", sector: "公益事業", price: 620, changePct: -1.5, volume: 25_000_000, marketCap: 990_000, per: 10.0, pbr: 0.8, dividendYield: 0.0, roe: 7.0 },
  // 不動産
  { ticker: "8801.T", name: "三井不動産", market: "JP", sector: "不動産", price: 1_450, changePct: 0.3, volume: 12_000_000, marketCap: 3_900_000, per: 14.0, pbr: 1.1, dividendYield: 2.0, roe: 8.0 },
];

export const SAMPLE_STOCKS: Stock[] = [...SAMPLE_US_STOCKS, ...SAMPLE_JP_STOCKS];
