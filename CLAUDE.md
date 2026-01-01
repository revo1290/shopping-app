# CLAUDE.md

Claude Code向けのプロジェクトガイドラインです。

## プロジェクト概要

**お買い物チェック** - 買い物リスト管理とストック管理のWebアプリケーション

- **目的**: 日常の買い物リスト作成、購入状態管理、在庫管理
- **対象ユーザー**: 一般ユーザー（認証機能なし）
- **技術スタック**: Backend (Express + SQLite) / Frontend (Vue 3 + Vite)

## ディレクトリ構造

```
shopping-app/
├── backend/                    # REST API サーバー
│   ├── src/
│   │   ├── index.js            # エントリポイント（サーバー起動）
│   │   ├── app.js              # Express設定（CORS、ルーター登録）
│   │   ├── database.js         # SQLite接続・スキーマ定義
│   │   └── routes/
│   │       └── items.js        # 商品CRUD API（全エンドポイント）
│   ├── __tests__/
│   │   └── items.test.js       # API統合テスト
│   └── package.json
├── frontend/                   # Vue 3 SPA
│   ├── src/
│   │   ├── main.js             # Vueアプリ初期化
│   │   ├── App.vue             # ルートコンポーネント（状態管理の中心）
│   │   ├── composables/
│   │   │   └── useApi.js       # API通信・定数定義
│   │   └── components/
│   │       ├── ItemForm.vue    # 商品登録フォーム
│   │       ├── ItemList.vue    # 商品一覧・チェックボックス
│   │       ├── FilterBar.vue   # 検索・フィルター・ソート
│   │       ├── EditModal.vue   # 商品編集モーダル
│   │       └── StatsPanel.vue  # 統計ダッシュボード
│   ├── __tests__/
│   │   ├── useApi.test.js
│   │   └── components.test.js
│   └── package.json
└── README.md
```

## 開発コマンド

```bash
# Backend（ポート3000）
cd backend && npm install && npm run dev

# Frontend（ポート5173、APIはプロキシ経由）
cd frontend && npm install && npm run dev

# テスト実行
cd backend && npm test
cd frontend && npm test
```

## データベーススキーマ

**テーブル: items**

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー（自動採番） |
| name | TEXT NOT NULL | 商品名（必須） |
| quantity | INTEGER DEFAULT 1 | 購入数 |
| stock | INTEGER DEFAULT 0 | 現在の在庫数 |
| memo | TEXT | メモ（任意） |
| category | TEXT DEFAULT 'other' | カテゴリ |
| priority | TEXT DEFAULT 'medium' | 優先度 |
| deadline | TEXT | 購入期限（YYYY-MM-DD） |
| purchased | INTEGER DEFAULT 0 | 購入済みフラグ（0/1） |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

## API仕様

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/health | ヘルスチェック |
| GET | /api/items | 一覧取得（クエリ: search, category, priority, purchased, sort, order） |
| GET | /api/items/stats | 統計情報 |
| GET | /api/items/:id | 単一取得 |
| POST | /api/items | 登録 |
| PUT | /api/items/:id | 更新（部分更新可） |
| DELETE | /api/items/:id | 削除 |

## 定数定義

### カテゴリ（frontend/src/composables/useApi.js）
| 値 | 表示名 | アイコン |
|----|--------|---------|
| food | 食品 | 🍎 |
| daily | 日用品 | 🧴 |
| drink | 飲料 | 🥤 |
| snack | お菓子 | 🍪 |
| frozen | 冷凍食品 | 🧊 |
| other | その他 | 📦 |

### 優先度
| 値 | 表示名 | 色 |
|----|--------|-----|
| high | 高 | 赤 |
| medium | 中 | オレンジ |
| low | 低 | 緑 |

## コーディング規約

### 命名規則
- **ファイル名**: kebab-case（例: `item-list.vue`）※現状はPascalCase
- **コンポーネント名**: PascalCase（例: `ItemList`）
- **関数名**: camelCase（例: `handleAddItem`）
- **定数**: UPPER_SNAKE_CASE（例: `CATEGORIES`）
- **イベントハンドラ**: `handle` + 動詞（例: `handleDeleteItem`）

### Vueコンポーネント
- Composition API（`<script setup>`）を使用
- 状態管理はApp.vueで集中管理、子コンポーネントはprops/emitで通信
- CSSはScoped Styleを使用

### バックエンド
- 同期SQLite（better-sqlite3）を使用
- エラーは適切なHTTPステータスコードで返却
- バリデーションはroutes/items.jsで実施

## 開発時の注意点

### 重要なファイル
- **API変更時**: `backend/src/routes/items.js` と `frontend/src/composables/useApi.js` を同時に更新
- **DB変更時**: `backend/src/database.js` でマイグレーション処理を追加
- **新コンポーネント追加時**: App.vueでimportし、状態管理のパターンに従う

### よくある操作
1. **新フィールド追加**: database.js → items.js → useApi.js → 各コンポーネント
2. **フィルター追加**: FilterBar.vue → App.vue(filters) → items.js(クエリ処理)
3. **統計追加**: items.js(/stats) → StatsPanel.vue

### 禁止事項
- フロントエンドから直接SQLiteにアクセスしない
- グローバル状態管理ライブラリは使用しない（App.vueで集中管理）
- 認証機能は不要（追加しない）

## テストルール

### 必須要件
1. 実際の機能を検証する（`expect(true).toBe(true)`禁止）
2. 具体的な入出力を検証
3. モックは必要最小限（外部API、タイマーのみ）
4. エッジケース・エラーシナリオをテスト
5. 仕様を理解してからテスト作成

### テスト構造
```javascript
describe('Feature', () => {
  describe('method', () => {
    it('should [期待動作] when [条件]', () => {
      // Arrange - 準備
      // Act - 実行
      // Assert - 検証
    });
  });
});
```

### テスト実行
```bash
npm test              # 実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ
```

## 機能一覧

| 機能 | 説明 | 関連ファイル |
|------|------|-------------|
| 商品登録 | 名前必須、他はオプション | ItemForm.vue, items.js |
| 商品編集 | モーダルで全項目編集可 | EditModal.vue |
| 商品削除 | 確認ダイアログ付き | ItemList.vue |
| 購入チェック | チェックボックスで切替 | ItemList.vue |
| 在庫管理 | ±ボタンで在庫調整、≤1で警告 | ItemList.vue |
| 検索 | 商品名・メモで部分一致（300msデバウンス） | FilterBar.vue |
| フィルター | カテゴリ/優先度/購入状態 | FilterBar.vue |
| ソート | 登録日/期限/優先度/名前/在庫 | FilterBar.vue |
| 統計 | 合計/未購入/購入済/在庫少/期限間近 | StatsPanel.vue |

## トラブルシューティング

| 問題 | 解決方法 |
|------|----------|
| APIエラー | バックエンドが起動しているか確認（ポート3000） |
| CORS エラー | backend/src/app.jsのCORS設定を確認 |
| DB接続エラー | shopping.dbファイルの権限を確認 |
| テスト失敗 | テスト用DBが分離されているか確認（NODE_ENV=test） |
