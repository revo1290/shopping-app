const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/items - 商品一覧取得（検索・フィルター・ソート対応）
router.get('/', (req, res) => {
  const { search, category, priority, purchased, sort, order } = req.query;

  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  // 検索（商品名・メモで部分一致検索）
  if (search && search.trim()) {
    sql += ' AND (name LIKE ? OR memo LIKE ?)';
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm);
  }

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (priority && priority !== 'all') {
    sql += ' AND priority = ?';
    params.push(priority);
  }
  if (purchased !== undefined && purchased !== 'all') {
    sql += ' AND purchased = ?';
    params.push(purchased === 'true' ? 1 : 0);
  }

  // ソート
  const validSorts = ['created_at', 'deadline', 'priority', 'name', 'stock'];
  const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  if (sortColumn === 'priority') {
    sql += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${sortOrder}`;
  } else {
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;
  }

  const items = db.prepare(sql).all(...params);
  res.json(items);
});

// GET /api/items/stats - 統計情報
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM items').get();
  const purchased = db.prepare('SELECT COUNT(*) as count FROM items WHERE purchased = 1').get();
  const lowStock = db.prepare('SELECT COUNT(*) as count FROM items WHERE stock <= 1 AND purchased = 0').get();
  const urgent = db.prepare("SELECT COUNT(*) as count FROM items WHERE deadline <= date('now', '+3 days') AND deadline IS NOT NULL AND purchased = 0").get();
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM items GROUP BY category').all();
  const byPriority = db.prepare('SELECT priority, COUNT(*) as count FROM items WHERE purchased = 0 GROUP BY priority').all();

  res.json({
    total: total.count,
    purchased: purchased.count,
    remaining: total.count - purchased.count,
    lowStock: lowStock.count,
    urgent: urgent.count,
    byCategory,
    byPriority
  });
});

// GET /api/items/:id - 商品詳細取得
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  res.json(item);
});

// POST /api/items - 商品登録
router.post('/', (req, res) => {
  const { name, quantity, stock, memo, category, priority, deadline } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: '商品名は必須です' });
  }

  const stmt = db.prepare(`
    INSERT INTO items (name, quantity, stock, memo, category, priority, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name.trim(),
    quantity || 1,
    stock || 0,
    memo || null,
    category || 'other',
    priority || 'medium',
    deadline || null
  );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/items/:id - 商品更新
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, stock, memo, category, priority, deadline, purchased } = req.body;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  // 商品名のバリデーション（更新時）
  if (name !== undefined && (!name || name.trim() === '')) {
    return res.status(400).json({ error: '商品名は必須です' });
  }

  const stmt = db.prepare(`
    UPDATE items SET
      name = ?,
      quantity = ?,
      stock = ?,
      memo = ?,
      category = ?,
      priority = ?,
      deadline = ?,
      purchased = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    name !== undefined ? name.trim() : existing.name,
    quantity !== undefined ? quantity : existing.quantity,
    stock !== undefined ? stock : existing.stock,
    memo !== undefined ? memo : existing.memo,
    category !== undefined ? category : existing.category,
    priority !== undefined ? priority : existing.priority,
    deadline !== undefined ? deadline : existing.deadline,
    purchased !== undefined ? (purchased ? 1 : 0) : existing.purchased,
    id
  );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json(item);
});

// DELETE /api/items/:id - 商品削除
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.status(204).send();
});

module.exports = router;
