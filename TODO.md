# TODO.md - お買い物チェック アプリケーション構築計画

## 概要

このドキュメントはアプリケーション構築の実行計画です。
チェック済み項目は完了、未チェック項目は未着手または進行中です。

---

## Phase 1: プロジェクト初期設定

- [x] プロジェクトディレクトリ構造の作成
- [x] Git リポジトリの初期化
- [x] .gitignore の設定

---

## Phase 2: Backend (Express + SQLite)

### 2.1 環境構築
- [x] package.json の作成
- [x] 依存パッケージのインストール (express, cors, better-sqlite3)
- [x] 開発用依存パッケージのインストール (vitest, supertest)

### 2.2 サーバー設定
- [x] Express サーバーのエントリポイント作成 (`src/index.js`)
- [x] Express アプリケーション設定 (`src/app.js`)
  - [x] CORS ミドルウェア設定
  - [x] JSON パーサー設定
  - [x] ルーター登録

### 2.3 データベース
- [x] SQLite 接続設定 (`src/database.js`)
- [x] items テーブルスキーマ設計
  - [x] id (主キー)
  - [x] name (商品名)
  - [x] quantity (購入数)
  - [x] stock (在庫数)
  - [x] memo (メモ)
  - [x] category (カテゴリ)
  - [x] priority (優先度)
  - [x] deadline (購入期限)
  - [x] purchased (購入済みフラグ)
  - [x] created_at / updated_at (タイムスタンプ)
- [x] マイグレーション処理の実装

### 2.4 API エンドポイント (`src/routes/items.js`)
- [x] GET /api/health - ヘルスチェック
- [x] GET /api/items - 商品一覧取得
  - [x] 検索機能 (search)
  - [x] カテゴリフィルター (category)
  - [x] 優先度フィルター (priority)
  - [x] 購入状態フィルター (purchased)
  - [x] ソート機能 (sort, order)
- [x] GET /api/items/stats - 統計情報取得
- [x] GET /api/items/:id - 単一商品取得
- [x] POST /api/items - 商品登録
  - [x] バリデーション実装
- [x] PUT /api/items/:id - 商品更新
  - [x] 部分更新対応
- [x] DELETE /api/items/:id - 商品削除

### 2.5 Backend テスト
- [x] テスト環境設定 (vitest.config.js)
- [x] API 統合テスト (`__tests__/items.test.js`)
  - [x] CRUD 操作テスト
  - [x] フィルター・検索テスト
  - [x] バリデーションテスト
  - [x] エッジケーステスト

---

## Phase 3: Frontend (Vue 3 + Vite)

### 3.1 環境構築
- [x] Vite プロジェクト作成
- [x] package.json の設定
- [x] 依存パッケージのインストール (vue)
- [x] 開発用依存パッケージのインストール (@vitejs/plugin-vue, vitest, @vue/test-utils, happy-dom)

### 3.2 Vite 設定
- [x] vite.config.js 作成
  - [x] Vue プラグイン設定
  - [x] 開発サーバー設定 (ポート 5173)
  - [x] API プロキシ設定 (/api → localhost:3000)
  - [x] テスト環境設定

### 3.3 API 通信層
- [x] useApi composable 作成 (`src/composables/useApi.js`)
  - [x] getItems - 商品一覧取得
  - [x] getItem - 単一商品取得
  - [x] getStats - 統計取得
  - [x] createItem - 商品登録
  - [x] updateItem - 商品更新
  - [x] deleteItem - 商品削除
- [x] 定数定義
  - [x] CATEGORIES (カテゴリ一覧)
  - [x] PRIORITIES (優先度一覧)

### 3.4 コンポーネント実装

#### ルートコンポーネント
- [x] App.vue 作成
  - [x] 状態管理 (items, stats, filters)
  - [x] イベントハンドラ実装
  - [x] レイアウト構成 (ヘッダー、メイン、フッター)

#### 商品登録フォーム
- [x] ItemForm.vue 作成
  - [x] 商品名入力 (必須)
  - [x] 詳細設定の展開/折りたたみ
  - [x] カテゴリ選択ボタン
  - [x] 優先度選択ボタン
  - [x] 購入期限ピッカー
  - [x] 購入数・在庫数入力 (±ボタン)
  - [x] メモ入力
  - [x] フォーム送信・リセット

#### 商品一覧
- [x] ItemList.vue 作成
  - [x] 商品カード表示
  - [x] 購入チェックボックス
  - [x] カテゴリバッジ
  - [x] 優先度バッジ
  - [x] 在庫表示・警告 (≤1)
  - [x] 期限表示・警告
  - [x] 編集・削除ボタン
  - [x] 在庫調整ボタン (±)
  - [x] 空状態メッセージ
  - [x] TransitionGroup アニメーション

#### 検索・フィルター
- [x] FilterBar.vue 作成
  - [x] 検索ボックス (300ms デバウンス)
  - [x] カテゴリフィルター
  - [x] 優先度フィルター
  - [x] 購入状態フィルター
  - [x] ソート選択
  - [x] ソート順序切替

#### 編集モーダル
- [x] EditModal.vue 作成
  - [x] Teleport によるモーダル表示
  - [x] 商品情報編集フォーム
  - [x] キャンセル・保存ボタン
  - [x] Transition アニメーション

#### 統計ダッシュボード
- [x] StatsPanel.vue 作成
  - [x] 登録商品数
  - [x] 未購入数
  - [x] 購入済み数
  - [x] 在庫少数 (警告表示)
  - [x] 期限間近数 (警告表示)
  - [x] レスポンシブグリッド

### 3.5 スタイリング
- [x] グローバルスタイル (App.vue)
- [x] コンポーネント Scoped Style
- [x] レスポンシブ対応
- [x] アニメーション・トランジション

### 3.6 Frontend テスト
- [x] useApi composable テスト (`__tests__/useApi.test.js`)
- [x] コンポーネントテスト (`__tests__/components.test.js`)

---

## Phase 4: ドキュメント

- [x] README.md 作成
  - [x] 機能一覧
  - [x] 使用技術
  - [x] 環境構築手順
  - [x] API 仕様
  - [x] デプロイ手順
- [x] CLAUDE.md 作成
  - [x] プロジェクト概要
  - [x] ディレクトリ構造
  - [x] 開発コマンド
  - [x] DB スキーマ
  - [x] コーディング規約
  - [x] テストルール

---

## Phase 5: 品質改善・不足機能 (残タスク)

### 5.1 Backend - エラーハンドリング
- [x] グローバルエラーハンドラの追加 (`app.js`)
- [x] 非同期エラーのキャッチ処理
- [x] エラーレスポンスの統一フォーマット化

### 5.2 Backend - 入力バリデーション強化
- [x] quantity の数値バリデーション（正の整数のみ）
- [x] stock の数値バリデーション（0以上の整数）
- [x] category の許可値チェック（food, daily, drink, snack, frozen, other のみ）
- [x] priority の許可値チェック（high, medium, low のみ）
- [x] deadline の日付形式バリデーション（YYYY-MM-DD）
- [x] name の最大長制限（例: 100文字）
- [x] memo の最大長制限（例: 500文字）

### 5.3 Backend - セキュリティ強化
- [x] Helmet（セキュリティヘッダー）の導入
- [x] レート制限の実装（express-rate-limit）
- [x] リクエストボディサイズ制限の設定
- [x] SQLインジェクション対策の確認・強化（prepared statements使用済み）

### 5.4 Backend - ログ・監視
- [x] リクエストログの追加（morgan）
- [x] エラーログ機能の実装
- [x] ヘルスチェックの拡張（DB接続状態）

### 5.5 Frontend - ユーザーフィードバック
- [x] トースト/通知コンポーネントの作成
- [x] 操作成功時の通知表示
- [x] エラー発生時の通知表示
- [x] ローディングインジケータの改善

### 5.6 Frontend - エラーハンドリング
- [x] ネットワークエラー時のリトライ機能
- [x] オフライン状態の検出・表示
- [x] API エラーの詳細表示

### 5.7 Frontend - アクセシビリティ (a11y)
- [x] aria-label, aria-describedby 属性の追加
- [x] キーボード操作のサポート強化
- [x] フォーカス管理の改善
- [x] スクリーンリーダー対応
- [x] カラーコントラストの確認

### 5.8 Frontend - テストカバレッジ拡充
- [ ] ItemList.vue のテスト追加
- [ ] EditModal.vue のテスト追加
- [ ] StatsPanel.vue のテスト追加
- [ ] App.vue の統合テスト追加

### 5.9 E2E テスト
- [ ] Playwright または Cypress の導入
- [ ] 商品登録フローのE2Eテスト
- [ ] 検索・フィルター機能のE2Eテスト
- [ ] 編集・削除フローのE2Eテスト

### 5.10 開発環境・設定
- [ ] .env.example ファイルの作成
- [ ] ESLint 設定の追加
- [ ] Prettier 設定の追加
- [ ] husky + lint-staged の設定（コミット時lint）

### 5.11 Docker 対応
- [ ] backend/Dockerfile の作成
- [ ] frontend/Dockerfile の作成
- [ ] docker-compose.yml の作成
- [ ] Docker ドキュメントの追加

---

## Phase 6: 追加機能 (オプション)

### 6.1 UX 改善
- [ ] 一括選択・一括削除機能
- [ ] 購入済み商品の一括クリア
- [ ] ドラッグ&ドロップによる並び替え
- [ ] ページネーション（大量データ対応）
- [ ] 無限スクロール

### 6.2 拡張機能
- [ ] PWA 対応
- [ ] オフライン機能（Service Worker）
- [ ] プッシュ通知（期限間近アラート）
- [ ] 複数リスト管理
- [ ] 履歴機能（購入履歴）
- [ ] データエクスポート/インポート（CSV, JSON）
- [ ] ダークモード
- [ ] 多言語対応 (i18n)

---

## Phase 7: デプロイ

### 7.1 GitHub
- [ ] GitHub リポジトリ作成
- [ ] リモートリポジトリへプッシュ

### 7.2 Frontend デプロイ (Vercel)
- [ ] Vercel アカウント連携
- [ ] プロジェクト設定
  - [ ] Framework: Vite
  - [ ] Root Directory: frontend
  - [ ] Build Command: npm run build
  - [ ] Output Directory: dist
- [ ] 環境変数設定 (VITE_API_URL)
- [ ] デプロイ実行

### 7.3 Backend デプロイ (Render)
- [ ] Render アカウント連携
- [ ] Web Service 作成
  - [ ] Root Directory: backend
  - [ ] Build Command: npm install
  - [ ] Start Command: npm start
- [ ] デプロイ実行

### 7.4 本番環境接続
- [ ] Frontend の API_BASE URL 設定
- [ ] 動作確認

---

## 進捗サマリー

| Phase | 項目数 | 完了 | 進捗率 |
|-------|--------|------|--------|
| Phase 1: 初期設定 | 3 | 3 | 100% |
| Phase 2: Backend | 28 | 28 | 100% |
| Phase 3: Frontend | 43 | 43 | 100% |
| Phase 4: ドキュメント | 12 | 12 | 100% |
| Phase 5: 品質改善 | 38 | 26 | 68% |
| Phase 6: 追加機能 | 13 | 0 | 0% |
| Phase 7: デプロイ | 10 | 0 | 0% |
| **合計** | **147** | **112** | **76%** |

---

## 優先度別 残タスク

### 高優先度（本番運用に必須）
1. ~~グローバルエラーハンドラの追加~~ ✅
2. ~~入力バリデーション強化~~ ✅
3. ~~セキュリティヘッダー（Helmet）の導入~~ ✅
4. ~~トースト/通知機能の実装~~ ✅
5. デプロイ設定

### 中優先度（品質向上）
1. テストカバレッジ拡充（ItemList, EditModal, StatsPanel）
2. ~~アクセシビリティ改善~~ ✅
3. ~~ログ・監視機能の追加~~ ✅
4. ESLint/Prettier 設定

### 低優先度（将来的な拡張）
1. PWA/オフライン対応
2. Docker対応
3. ダークモード
4. 多言語対応

---

*最終更新: 2026-01-04*
