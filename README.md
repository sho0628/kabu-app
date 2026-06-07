# 📈 kabu-app

米国株・日本株の両方に対応した、**株式セクター分析 & バリュー株スクリーナー**の Web アプリです。

- **セクター資金流入の可視化** — どのセクターに資金が集まっているかをヒートマップとランキングで表示
- **バリュー株の自動ピックアップ** — 低PER・低PBR・高配当・高ROE の条件で割安・優良株を自動抽出し、バリュースコア順に表示
- **米国株・日本株 両対応** — 全市場 / 🇺🇸米国 / 🇯🇵日本 を切り替え可能

> ⚠️ 本アプリは投資助言ではありません。表示データにはサンプル/非公式データを含みます。投資判断はご自身の責任で行ってください。

## 🚀 公開URLで確認する（Vercel・無料）

GitHubアカウントがあれば、数クリックで公開URL（`https://....vercel.app`）を作れます。スマホからも確認できます。

> このリポジトリが**プライベート（非公開）**の場合は「Deploy（複製）」ボタンは使えません。代わりに以下の**「自分のリポジトリをImport」**する手順を使ってください（プライベートのままでOK）。

1. [vercel.com/new](https://vercel.com/new) を開く → GitHubでログイン
2. **Import Git Repository** の一覧から **`kabu-app`** を選ぶ
   - 出てこない場合は **「Adjust GitHub App Permissions / Configure GitHub App」** からVercelに `kabu-app` へのアクセスを許可
3. `kabu-app` の **Import** を押す
4. Branch を **`claude/stock-trading-webapp-fsIjM`** に設定（環境変数の設定は不要。既定でYahooのライブデータを取得）
5. **Deploy** を押す → 1〜2分で `https://kabu-app-xxxx.vercel.app` が発行されます

> リポジトリを**公開（Public）**にしている場合は、下のボタンからの複製でもOKです。
>
> [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sho0628/kabu-app/tree/claude/stock-trading-webapp-fsIjM&project-name=kabu-app&repository-name=kabu-app)

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS v4
- データ取得: [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)（プラグイン式で差し替え可能）

## セットアップ

```bash
npm install
cp .env.example .env.local   # 必要に応じて編集
npm run dev                  # http://localhost:3000
```

ビルド/本番起動:

```bash
npm run build && npm run start
```

## データソース

`DATA_SOURCE` 環境変数で切り替えます（既定は `yahoo`）。

| 値 | 内容 | キー |
|----|------|------|
| `yahoo` | 無料・準リアルタイム・両市場対応（既定） | 不要 |
| `sample` | 同梱のサンプルデータのみ（オフライン/デモ） | 不要 |
| `vendor` | 米国=Finnhub / 日本=J-Quants | 各APIキー |

いずれのソースでも取得に失敗した場合は**自動的にサンプルデータにフォールバック**し、画面には実際に使われたソース名を表示します。

### データソース別メモ

- **Yahoo Finance**: 非公式API。`set-cookie` を要求するため、Cookie を遮断するネットワーク環境では取得に失敗し、サンプルにフォールバックします（その場合も通常のデプロイ環境やローカルでは動作します）。商用・大量アクセスは規約に注意。
- **Finnhub**（米国株・無料60req/分）: リアルタイム。`FINNHUB_API_KEY` を設定。
- **J-Quants**（日本株・無料枠は12週間遅延/過去2年/5req毎分）: 財務指標が充実しバリュー株向き。`JQUANTS_REFRESH_TOKEN` を設定。リアルタイム性が必要な場合は有料プランを検討。

## 構成

```
src/
  app/
    page.tsx              # ダッシュボード(セクター資金流入マップ)
    screener/page.tsx     # バリュー株スクリーナー
    api/
      sectors/route.ts    # セクター集計API
      screener/route.ts   # スクリーニングAPI
  components/             # Nav / MarketToggle / SectorHeatmap
  lib/
    types.ts             # 共通型
    sectors.ts           # セクター集計ロジック
    screener.ts          # バリュースコア算出ロジック
    format.ts            # 表示フォーマット
    data/sampleStocks.ts # サンプルデータ
    providers/           # データ取得(yahoo / finnhub / jquants / index)
```

## ロジックの考え方

### セクター資金流入スコア
時価総額加重の平均騰落率に、売買代金回転率（売買代金 ÷ 時価総額）を掛け合わせて算出。
値上がり × 取引の活発さ がプラスに働くほど「資金が集まっている」と判断します。

### バリュースコア（0–100）
PER・PBR・配当利回り・ROE をそれぞれ 0–1 に正規化し、
バリュー重視（PER 30% / PBR 30% / 配当 20% / ROE 20%）で加重平均したものを 100 点満点で表示します。
スクリーナーの各しきい値（PER上限・PBR上限・配当下限・ROE下限）はスライダーで調整できます。

## 今後の拡張アイデア

- 取得データのDBキャッシュ（API制限の回避・履歴蓄積）
- 銘柄ユニバースの拡張（S&P500・TOPIX構成銘柄の自動読み込み）
- ウォッチリスト/お気に入り、個別銘柄の詳細チャート
- セクター資金フローの時系列推移
