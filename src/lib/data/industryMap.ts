// =============================================================
// Yahoo の業種(industry, 英語) → 日本語の細分類ラベルへの対応表。
// セクター(大分類)より細かい粒度。未登録の業種は英語のまま表示する。
// =============================================================

// 表記ゆれ(em dash "—" / en dash "–" / hyphen "-"、大文字小文字、空白)を吸収。
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[—–-]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

const RAW: Record<string, string> = {
  // 情報技術
  "Semiconductors": "半導体",
  "Semiconductor Equipment & Materials": "半導体製造装置",
  "Software—Infrastructure": "ソフトウェア(インフラ)",
  "Software—Application": "ソフトウェア(アプリ)",
  "Information Technology Services": "ITサービス",
  "Consumer Electronics": "家電・電子機器",
  "Computer Hardware": "コンピュータ機器",
  "Electronic Components": "電子部品",
  "Scientific & Technical Instruments": "計測・精密機器",
  "Communication Equipment": "通信機器",
  // 通信サービス
  "Internet Content & Information": "インターネット",
  "Entertainment": "エンタメ",
  "Telecom Services": "通信サービス",
  "Electronic Gaming & Multimedia": "ゲーム",
  // 一般消費財
  "Auto Manufacturers": "自動車",
  "Auto Parts": "自動車部品",
  "Internet Retail": "ネット通販",
  "Restaurants": "外食",
  "Home Improvement Retail": "ホームセンター",
  "Specialty Retail": "専門小売",
  "Footwear & Accessories": "アパレル・靴",
  "Apparel Retail": "アパレル小売",
  "Travel Services": "旅行・サービス",
  "Lodging": "宿泊",
  "Department Stores": "百貨店",
  // 生活必需品
  "Beverages—Non-Alcoholic": "飲料(ノンアル)",
  "Beverages—Brewers": "ビール・酒類",
  "Beverages—Wineries & Distilleries": "酒類",
  "Household & Personal Products": "日用品",
  "Packaged Foods": "食品",
  "Discount Stores": "ディスカウント店",
  "Tobacco": "たばこ",
  "Grocery Stores": "食品スーパー",
  "Confectioners": "菓子",
  // ヘルスケア
  "Drug Manufacturers—General": "医薬品(大手)",
  "Drug Manufacturers—Specialty & Generic": "医薬品(専門・後発)",
  "Biotechnology": "バイオ",
  "Healthcare Plans": "医療保険",
  "Medical Devices": "医療機器",
  "Medical Instruments & Supplies": "医療機器・用品",
  "Diagnostics & Research": "診断・research",
  // 金融
  "Banks—Diversified": "総合銀行",
  "Banks—Regional": "地方銀行",
  "Insurance—Diversified": "総合保険",
  "Insurance—Life": "生命保険",
  "Insurance—Property & Casualty": "損害保険",
  "Asset Management": "資産運用",
  "Capital Markets": "証券",
  "Credit Services": "決済・クレジット",
  "Financial Data & Stock Exchanges": "金融データ・取引所",
  "Insurance Brokers": "保険ブローカー",
  // エネルギー
  "Oil & Gas Integrated": "石油・ガス(統合)",
  "Oil & Gas E&P": "石油・ガス開発",
  "Oil & Gas Midstream": "石油・ガス中流",
  "Oil & Gas Refining & Marketing": "石油精製・販売",
  "Oil & Gas Equipment & Services": "油田サービス",
  // 資本財
  "Aerospace & Defense": "航空・防衛",
  "Specialty Industrial Machinery": "産業機械",
  "Farm & Heavy Construction Machinery": "建設・農業機械",
  "Integrated Freight & Logistics": "総合物流",
  "Railroads": "鉄道",
  "Building Products & Equipment": "建材・設備",
  "Industrial Distribution": "産業用流通",
  "Electrical Equipment & Parts": "電機設備・部品",
  "Engineering & Construction": "エンジニアリング・建設",
  "Conglomerates": "コングロマリット",
  // 素材
  "Specialty Chemicals": "専門化学",
  "Chemicals": "化学",
  "Steel": "鉄鋼",
  "Building Materials": "建材",
  "Copper": "銅",
  "Gold": "金",
  "Aluminum": "アルミ",
  "Agricultural Inputs": "農業資材",
  // 公益事業
  "Utilities—Regulated Electric": "電力",
  "Utilities—Regulated Gas": "ガス",
  "Utilities—Diversified": "総合公益",
  "Utilities—Renewable": "再生可能エネルギー",
  // 不動産
  "REIT—Industrial": "REIT(物流)",
  "REIT—Specialty": "REIT(専門)",
  "REIT—Residential": "REIT(住宅)",
  "REIT—Retail": "REIT(商業)",
  "REIT—Office": "REIT(オフィス)",
  "Real Estate—Development": "不動産開発",
  "Real Estate Services": "不動産サービス",
};

// 正規化キーで引けるよう前計算。
const NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [normalize(k), v])
);

// 英語の業種名を日本語ラベルへ。未登録なら英語のまま返す(空なら「その他」)。
export function jpIndustry(industryEn: string | null | undefined): string {
  if (!industryEn) return "その他";
  return NORMALIZED[normalize(industryEn)] ?? industryEn;
}
