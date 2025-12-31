# お買い物管理Webアプリ

商品の登録・編集・一覧表示・削除・購入済み状態の管理ができるWebアプリケーションです。
在庫管理、購入期限、カテゴリ、優先度の設定、商品検索機能も備えています。

## 機能一覧

- 商品の登録（名前、購入数、在庫数、メモ、カテゴリ、優先度、購入期限）
- 商品の編集
- 商品の削除
- 購入済み/未購入の状態切り替え
- 商品検索（名前・メモで検索）
- フィルタリング（カテゴリ、優先度、購入状態）
- ソート（登録日、期限、優先度、名前、在庫）
- 統計ダッシュボード

## 使用技術

### フロントエンド
- Vue.js 3 (Composition API)
- Vite 5
- fetch API
- Vitest + Vue Test Utils（テスト）

### バックエンド
- Node.js
- Express 4
- SQLite (better-sqlite3)
- Vitest + supertest（テスト）

## 環境要件

- Node.js >= 18.0.0
- npm >= 9.0.0

## ディレクトリ構成

```
shopping-app/
├── backend/
│   ├── src/
│   │   ├── index.js          # Expressサーバー（エントリポイント）
│   │   ├── app.js            # Expressアプリ設定
│   │   ├── database.js       # SQLite接続・スキーマ
│   │   └── routes/
│   │       └── items.js      # 商品API
│   ├── __tests__/
│   │   └── items.test.js     # APIテスト
│   ├── package.json
│   └── vitest.config.js
├── frontend/
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── composables/
│   │   │   └── useApi.js     # fetch API通信処理
│   │   └── components/
│   │       ├── ItemForm.vue   # 商品登録フォーム
│   │       ├── ItemList.vue   # 商品一覧
│   │       ├── FilterBar.vue  # フィルター・検索バー
│   │       ├── EditModal.vue  # 編集モーダル
│   │       └── StatsPanel.vue # 統計パネル
│   ├── __tests__/
│   │   ├── useApi.test.js    # APIコンポーザブルテスト
│   │   └── components.test.js # コンポーネントテスト
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── CLAUDE.md
└── README.md
```

## 環境構築・起動方法

### 1. バックエンド起動

```bash
cd backend
npm install
npm run dev
```

サーバーが http://localhost:3000 で起動します。

### 2. フロントエンド起動（別ターミナル）

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

## テスト実行

### バックエンドテスト

```bash
cd backend
npm test                # テスト実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジ付き
```

### フロントエンドテスト

```bash
cd frontend
npm test                # テスト実行
npm run test:watch     # ウォッチモード
npm run test:ui        # UIモード
npm run test:coverage  # カバレッジ付き
```

## API仕様

### エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/items` | 商品一覧取得（フィルター・ソート対応） |
| GET | `/api/items/stats` | 統計情報取得 |
| GET | `/api/items/:id` | 商品詳細取得 |
| POST | `/api/items` | 商品登録 |
| PUT | `/api/items/:id` | 商品更新 |
| DELETE | `/api/items/:id` | 商品削除 |
| GET | `/api/health` | ヘルスチェック |

### クエリパラメータ（GET /api/items）

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| search | 商品名・メモで検索 | `?search=牛乳` |
| category | カテゴリでフィルタ | `?category=food` |
| priority | 優先度でフィルタ | `?priority=high` |
| purchased | 購入状態でフィルタ | `?purchased=false` |
| sort | ソートキー | `?sort=deadline` |
| order | ソート順序 | `?order=asc` |

### カテゴリ一覧

| 値 | 説明 |
|----|------|
| food | 食品 |
| daily | 日用品 |
| drink | 飲料 |
| snack | お菓子 |
| frozen | 冷凍食品 |
| other | その他 |

### 優先度一覧

| 値 | 説明 |
|----|------|
| high | 高 |
| medium | 中 |
| low | 低 |

### リクエスト/レスポンス例

#### GET /api/items
```json
[
  {
    "id": 1,
    "name": "牛乳",
    "quantity": 2,
    "stock": 0,
    "memo": "低脂肪",
    "category": "drink",
    "priority": "high",
    "deadline": "2024-01-15",
    "purchased": 0,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": null
  }
]
```

#### GET /api/items/stats
```json
{
  "total": 10,
  "purchased": 3,
  "unpurchased": 7,
  "byCategory": {
    "food": 4,
    "daily": 2,
    "drink": 3,
    "other": 1
  },
  "byPriority": {
    "high": 2,
    "medium": 5,
    "low": 3
  },
  "urgentItems": 2
}
```

#### POST /api/items
リクエスト:
```json
{
  "name": "牛乳",
  "quantity": 2,
  "stock": 0,
  "memo": "低脂肪",
  "category": "drink",
  "priority": "high",
  "deadline": "2024-01-15"
}
```

レスポンス:
```json
{
  "id": 1,
  "name": "牛乳",
  "quantity": 2,
  "stock": 0,
  "memo": "低脂肪",
  "category": "drink",
  "priority": "high",
  "deadline": "2024-01-15",
  "purchased": 0,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": null
}
```

#### PUT /api/items/:id
リクエスト:
```json
{
  "purchased": true,
  "stock": 2
}
```

---

## Git リポジトリ初期化

```bash
cd shopping-app

# Git初期化
git init

# .gitignore作成
echo "node_modules/
*.db
.DS_Store
coverage/" > .gitignore

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Shopping list app"
```

## GitHub へ push

```bash
# GitHubでリポジトリを作成後
git remote add origin https://github.com/YOUR_USERNAME/shopping-app.git
git branch -M main
git push -u origin main
```

## デプロイ

### フロントエンド: Vercel

1. [Vercel](https://vercel.com) にGitHubアカウントでログイン
2. 「New Project」→ GitHubリポジトリを選択
3. 設定:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 「Deploy」をクリック

### バックエンド: Render

1. [Render](https://render.com) にGitHubアカウントでログイン
2. 「New」→「Web Service」
3. GitHubリポジトリを選択
4. 設定:
   - Name: `shopping-app-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 「Create Web Service」をクリック

### 本番環境での接続設定

フロントエンドをデプロイ後、`frontend/src/composables/useApi.js` の `API_BASE` を本番APIのURLに変更するか、環境変数を使用してください。

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api'
```

Vercelの環境変数に `VITE_API_URL` を設定:
```
VITE_API_URL=https://shopping-app-api.onrender.com/api
```
