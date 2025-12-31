const Database = require('better-sqlite3');
const path = require('path');

let db = null;

function initDatabase(dbPath = null) {
  const actualPath = dbPath || path.join(__dirname, '..', 'shopping.db');
  db = new Database(actualPath);

  // テーブル作成（拡張版）
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      stock INTEGER DEFAULT 0,
      memo TEXT,
      category TEXT DEFAULT 'other',
      priority TEXT DEFAULT 'medium',
      deadline TEXT,
      purchased INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // 既存テーブルに新しいカラムを追加（マイグレーション）
  const columns = db.prepare("PRAGMA table_info(items)").all();
  const columnNames = columns.map(c => c.name);

  if (!columnNames.includes('stock')) {
    db.exec('ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT 0');
  }
  if (!columnNames.includes('category')) {
    db.exec("ALTER TABLE items ADD COLUMN category TEXT DEFAULT 'other'");
  }
  if (!columnNames.includes('priority')) {
    db.exec("ALTER TABLE items ADD COLUMN priority TEXT DEFAULT 'medium'");
  }
  if (!columnNames.includes('deadline')) {
    db.exec('ALTER TABLE items ADD COLUMN deadline TEXT');
  }
  if (!columnNames.includes('updated_at')) {
    db.exec('ALTER TABLE items ADD COLUMN updated_at DATETIME');
  }

  return db;
}

function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function clearDatabase() {
  if (db) {
    db.exec('DELETE FROM items');
  }
}

// 初期化（本番用）
if (process.env.NODE_ENV !== 'test') {
  initDatabase();
}

module.exports = {
  get prepare() {
    return getDatabase().prepare.bind(getDatabase());
  },
  get exec() {
    return getDatabase().exec.bind(getDatabase());
  },
  initDatabase,
  getDatabase,
  closeDatabase,
  clearDatabase
};
