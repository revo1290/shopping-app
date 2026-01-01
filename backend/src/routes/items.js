const express = require('express');
const router = express.Router();
const db = require('../database');

// 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ螳壽焚
const VALID_CATEGORIES = ['food', 'daily', 'drink', 'snack', 'frozen', 'other'];
const VALID_PRIORITIES = ['high', 'medium', 'low'];
const MAX_NAME_LENGTH = 100;
const MAX_MEMO_LENGTH = 500;

// 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ繝倥Ν繝代・髢｢謨ｰ
function validateItemData(data, isUpdate = false) {
  const errors = [];

  // 蝠・刀蜷阪ヰ繝ｪ繝・・繧ｷ繝ｧ繝ｳ
  if (!isUpdate || data.name !== undefined) {
    if (!isUpdate && (!data.name || data.name.trim() === '')) {
      errors.push('蝠・刀蜷阪・蠢・医〒縺・);
    } else if (data.name !== undefined) {
      if (data.name.trim() === '') {
        errors.push('蝠・刀蜷阪・蠢・医〒縺・);
      } else if (data.name.trim().length > MAX_NAME_LENGTH) {
        errors.push('蝠・刀蜷阪・' + MAX_NAME_LENGTH + '譁・ｭ嶺ｻ･蜀・〒蜈･蜉帙＠縺ｦ縺上□縺輔＞');
      }
    }
  }

  // 繝｡繝｢繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (data.memo !== undefined && data.memo !== null && data.memo.length > MAX_MEMO_LENGTH) {
    errors.push('繝｡繝｢縺ｯ' + MAX_MEMO_LENGTH + '譁・ｭ嶺ｻ･蜀・〒蜈･蜉帙＠縺ｦ縺上□縺輔＞');
  }

  // 雉ｼ蜈･謨ｰ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (data.quantity !== undefined && data.quantity !== null) {
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      errors.push('雉ｼ蜈･謨ｰ縺ｯ1莉･荳翫・謨ｴ謨ｰ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞');
    }
  }

  // 蝨ｨ蠎ｫ謨ｰ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (data.stock !== undefined && data.stock !== null) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      errors.push('蝨ｨ蠎ｫ謨ｰ縺ｯ0莉･荳翫・謨ｴ謨ｰ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞');
    }
  }

  // 繧ｫ繝・ざ繝ｪ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (data.category !== undefined && data.category !== null && !VALID_CATEGORIES.includes(data.category)) {
    errors.push('辟｡蜉ｹ縺ｪ繧ｫ繝・ざ繝ｪ縺ｧ縺・);
  }

  // 蜆ｪ蜈亥ｺｦ繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
  if (data.priority !== undefined && data.priority !== null && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push('辟｡蜉ｹ縺ｪ蜆ｪ蜈亥ｺｦ縺ｧ縺・);
  }

  // 雉ｼ蜈･譛滄剞繝舌Μ繝・・繧ｷ繝ｧ繝ｳ・・YYY-MM-DD蠖｢蠑擾ｼ・  if (data.deadline !== undefined && data.deadline !== null && data.deadline !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.deadline)) {
      errors.push('雉ｼ蜈･譛滄剞縺ｯYYYY-MM-DD蠖｢蠑上〒蜈･蜉帙＠縺ｦ縺上□縺輔＞');
    }
  }

  return errors;
}

// GET /api/items - 蝠・刀荳隕ｧ蜿門ｾ暦ｼ域､懃ｴ｢繝ｻ繝輔ぅ繝ｫ繧ｿ繝ｼ繝ｻ繧ｽ繝ｼ繝亥ｯｾ蠢懶ｼ・router.get('/', (req, res) => {
  const { search, category, priority, purchased, sort, order } = req.query;

  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  // 讀懃ｴ｢・亥膚蜩∝錐繝ｻ繝｡繝｢縺ｧ驛ｨ蛻・ｸ閾ｴ讀懃ｴ｢・・  if (search && search.trim()) {
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

  // 繧ｽ繝ｼ繝・  const validSorts = ['created_at', 'deadline', 'priority', 'name', 'stock'];
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

// GET /api/items/stats - 邨ｱ險域ュ蝣ｱ
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

// GET /api/items/:id - 蝠・刀隧ｳ邏ｰ蜿門ｾ・router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: '蝠・刀縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ' });
  }

  res.json(item);
});

// POST /api/items - 蝠・刀逋ｻ骭ｲ
router.post('/', (req, res) => {
  const { name, quantity, stock, memo, category, priority, deadline } = req.body;

  // 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ螳溯｡・  const errors = validateItemData(req.body, false);
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

// PUT /api/items/:id - 蝠・刀譖ｴ譁ｰ
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, stock, memo, category, priority, deadline, purchased } = req.body;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '蝠・刀縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ' });
  }

  // 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ螳溯｡・  const errors = validateItemData(req.body, true);
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

// DELETE /api/items/:id - 蝠・刀蜑企勁
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '蝠・刀縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ' });
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.status(204).send();
});

module.exports = router;
