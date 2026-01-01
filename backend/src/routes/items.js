const express = require('express');
const router = express.Router();
const db = require('../database');

// Validation constants
const VALID_CATEGORIES = ['food', 'daily', 'drink', 'snack', 'frozen', 'other'];
const VALID_PRIORITIES = ['high', 'medium', 'low'];
const MAX_NAME_LENGTH = 100;
const MAX_MEMO_LENGTH = 500;

// Validation helper function
function validateItemData(data, isUpdate = false) {
  const errors = [];

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!isUpdate && (!data.name || data.name.trim() === '')) {
      errors.push('商品名は必須です');
    } else if (data.name !== undefined) {
      if (data.name.trim() === '') {
        errors.push('商品名は必須です');
      } else if (data.name.trim().length > MAX_NAME_LENGTH) {
        errors.push('商品名は' + MAX_NAME_LENGTH + '文字以内で入力してください');
      }
    }
  }

  // Memo validation
  if (data.memo !== undefined && data.memo !== null && data.memo.length > MAX_MEMO_LENGTH) {
    errors.push('メモは' + MAX_MEMO_LENGTH + '文字以内で入力してください');
  }

  // Quantity validation
  if (data.quantity !== undefined && data.quantity !== null) {
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      errors.push('購入数は1以上の整数で入力してください');
    }
  }

  // Stock validation
  if (data.stock !== undefined && data.stock !== null) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      errors.push('在庫数は0以上の整数で入力してください');
    }
  }

  // Category validation
  if (data.category !== undefined && data.category !== null && !VALID_CATEGORIES.includes(data.category)) {
    errors.push('無効なカテゴリです');
  }

  // Priority validation
  if (data.priority !== undefined && data.priority !== null && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push('無効な優先度です');
  }

  // Deadline validation (YYYY-MM-DD format)
  if (data.deadline !== undefined && data.deadline !== null && data.deadline !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.deadline)) {
      errors.push('購入期限はYYYY-MM-DD形式で入力してください');
    }
  }

  return errors;
}

// GET /api/items - Get items list (with search, filter, sort)
router.get('/', (req, res) => {
  const { search, category, priority, purchased, sort, order } = req.query;

  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  // Search (partial match on name and memo)
  if (search && search.trim()) {
    sql += ' AND (name LIKE ? OR memo LIKE ?)';
    const searchTerm = '%' + search.trim() + '%';
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

  // Sort
  const validSorts = ['created_at', 'deadline', 'priority', 'name', 'stock'];
  const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  if (sortColumn === 'priority') {
    sql += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END " + sortOrder;
  } else {
    sql += ' ORDER BY ' + sortColumn + ' ' + sortOrder;
  }

  const items = db.prepare(sql).all(...params);
  res.json(items);
});

// GET /api/items/stats - Statistics
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

// GET /api/items/:id - Get single item
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  res.json(item);
});

// POST /api/items - Create item
router.post('/', (req, res) => {
  const { name, quantity, stock, memo, category, priority, deadline } = req.body;

  // Run validation
  const errors = validateItemData(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  const stmt = db.prepare(
    'INSERT INTO items (name, quantity, stock, memo, category, priority, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
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

// PUT /api/items/:id - Update item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, stock, memo, category, priority, deadline, purchased } = req.body;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  // Run validation
  const errors = validateItemData(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  const stmt = db.prepare(
    'UPDATE items SET name = ?, quantity = ?, stock = ?, memo = ?, category = ?, priority = ?, deadline = ?, purchased = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
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

// DELETE /api/items/:id - Delete item
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
