import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

// テスト用のインメモリデータベースとアプリを作成
let db
let app

function createTestDb() {
  const testDb = new Database(':memory:')
  testDb.exec(`
    CREATE TABLE items (
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
  `)
  return testDb
}

function createTestApp(testDb) {
  const testApp = express()
  testApp.use(cors())
  testApp.use(express.json())

  // Items routes inline for testing
  testApp.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  testApp.get('/api/items', (req, res) => {
    const { search, category, priority, purchased, sort, order } = req.query

    let sql = 'SELECT * FROM items WHERE 1=1'
    const params = []

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR memo LIKE ?)'
      const searchTerm = `%${search.trim()}%`
      params.push(searchTerm, searchTerm)
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?'
      params.push(category)
    }
    if (priority && priority !== 'all') {
      sql += ' AND priority = ?'
      params.push(priority)
    }
    if (purchased !== undefined && purchased !== 'all') {
      sql += ' AND purchased = ?'
      params.push(purchased === 'true' ? 1 : 0)
    }

    const validSorts = ['created_at', 'deadline', 'priority', 'name', 'stock']
    const sortColumn = validSorts.includes(sort) ? sort : 'created_at'
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC'

    if (sortColumn === 'priority') {
      sql += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${sortOrder}`
    } else {
      sql += ` ORDER BY ${sortColumn} ${sortOrder}`
    }

    const items = testDb.prepare(sql).all(...params)
    res.json(items)
  })

  testApp.get('/api/items/stats', (req, res) => {
    const total = testDb.prepare('SELECT COUNT(*) as count FROM items').get()
    const purchased = testDb.prepare('SELECT COUNT(*) as count FROM items WHERE purchased = 1').get()
    const lowStock = testDb.prepare('SELECT COUNT(*) as count FROM items WHERE stock <= 1 AND purchased = 0').get()
    const urgent = testDb.prepare("SELECT COUNT(*) as count FROM items WHERE deadline <= date('now', '+3 days') AND deadline IS NOT NULL AND purchased = 0").get()
    const byCategory = testDb.prepare('SELECT category, COUNT(*) as count FROM items GROUP BY category').all()
    const byPriority = testDb.prepare('SELECT priority, COUNT(*) as count FROM items WHERE purchased = 0 GROUP BY priority').all()

    res.json({
      total: total.count,
      purchased: purchased.count,
      remaining: total.count - purchased.count,
      lowStock: lowStock.count,
      urgent: urgent.count,
      byCategory,
      byPriority
    })
  })

  testApp.get('/api/items/:id', (req, res) => {
    const { id } = req.params
    const item = testDb.prepare('SELECT * FROM items WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json({ error: '商品が見つかりません' })
    }
    res.json(item)
  })

  testApp.post('/api/items', (req, res) => {
    const { name, quantity, stock, memo, category, priority, deadline } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '商品名は必須です' })
    }

    const stmt = testDb.prepare(`
      INSERT INTO items (name, quantity, stock, memo, category, priority, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      name.trim(),
      quantity || 1,
      stock || 0,
      memo || null,
      category || 'other',
      priority || 'medium',
      deadline || null
    )

    const item = testDb.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(item)
  })

  testApp.put('/api/items/:id', (req, res) => {
    const { id } = req.params
    const { name, quantity, stock, memo, category, priority, deadline, purchased } = req.body

    const existing = testDb.prepare('SELECT * FROM items WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: '商品が見つかりません' })
    }

    if (name !== undefined && (!name || name.trim() === '')) {
      return res.status(400).json({ error: '商品名は必須です' })
    }

    const stmt = testDb.prepare(`
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
    `)
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
    )

    const item = testDb.prepare('SELECT * FROM items WHERE id = ?').get(id)
    res.json(item)
  })

  testApp.delete('/api/items/:id', (req, res) => {
    const { id } = req.params
    const existing = testDb.prepare('SELECT * FROM items WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: '商品が見つかりません' })
    }
    testDb.prepare('DELETE FROM items WHERE id = ?').run(id)
    res.status(204).send()
  })

  return testApp
}

describe('Items API', () => {
  beforeAll(() => {
    db = createTestDb()
    app = createTestApp(db)
  })

  afterAll(() => {
    if (db) {
      db.close()
    }
  })

  beforeEach(() => {
    db.exec('DELETE FROM items')
  })

  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/api/health')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ok' })
    })
  })

  describe('POST /api/items', () => {
    it('should create a new item with required fields only', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
      expect(res.body.name).toBe('milk')
      expect(res.body.quantity).toBe(1)
      expect(res.body.stock).toBe(0)
      expect(res.body.category).toBe('other')
      expect(res.body.priority).toBe('medium')
      expect(res.body.purchased).toBe(0)
    })

    it('should create a new item with all fields', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          name: 'bread',
          quantity: 2,
          stock: 1,
          memo: 'whole grain',
          category: 'food',
          priority: 'high',
          deadline: '2025-01-15'
        })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe('bread')
      expect(res.body.quantity).toBe(2)
      expect(res.body.stock).toBe(1)
      expect(res.body.memo).toBe('whole grain')
      expect(res.body.category).toBe('food')
      expect(res.body.priority).toBe('high')
      expect(res.body.deadline).toBe('2025-01-15')
    })

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ quantity: 1 })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('必須')
    })

    it('should return 400 when name is empty string', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: '   ' })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('必須')
    })

    it('should trim whitespace from name', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: '  milk  ' })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe('milk')
    })
  })

  describe('GET /api/items', () => {
    beforeEach(async () => {
      await request(app).post('/api/items').send({ name: 'milk', category: 'drink', priority: 'high' })
      await request(app).post('/api/items').send({ name: 'bread', category: 'food', priority: 'medium', memo: 'whole grain' })
      await request(app).post('/api/items').send({ name: 'soap', category: 'daily', priority: 'low' })
    })

    it('should return all items', async () => {
      const res = await request(app).get('/api/items')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(3)
    })

    it('should filter by category', async () => {
      const res = await request(app).get('/api/items?category=drink')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('milk')
    })

    it('should filter by priority', async () => {
      const res = await request(app).get('/api/items?priority=high')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('milk')
    })

    it('should search by name', async () => {
      const res = await request(app).get('/api/items?search=milk')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('milk')
    })

    it('should search by memo', async () => {
      const res = await request(app).get('/api/items?search=whole')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('bread')
    })

    it('should return empty array when search has no match', async () => {
      const res = await request(app).get('/api/items?search=notexist')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })

    it('should sort by name ascending', async () => {
      const res = await request(app).get('/api/items?sort=name&order=asc')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(3)
      expect(res.body[0].name).toBe('bread')
      expect(res.body[1].name).toBe('milk')
      expect(res.body[2].name).toBe('soap')
    })

    it('should sort by priority', async () => {
      const res = await request(app).get('/api/items?sort=priority&order=asc')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(3)
      expect(res.body[0].priority).toBe('high')
      expect(res.body[1].priority).toBe('medium')
      expect(res.body[2].priority).toBe('low')
    })

    it('should filter purchased items', async () => {
      const items = await request(app).get('/api/items')
      await request(app)
        .put(`/api/items/${items.body[0].id}`)
        .send({ purchased: true })

      const res = await request(app).get('/api/items?purchased=true')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].purchased).toBe(1)
    })

    it('should filter unpurchased items', async () => {
      const res = await request(app).get('/api/items?purchased=false')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(3)
    })
  })

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      const res = await request(app).get(`/api/items/${createRes.body.id}`)

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('milk')
    })

    it('should return 404 for non-existent item', async () => {
      const res = await request(app).get('/api/items/99999')

      expect(res.status).toBe(404)
      expect(res.body.error).toContain('見つかりません')
    })
  })

  describe('PUT /api/items/:id', () => {
    it('should update item name', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ name: 'skim milk' })

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('skim milk')
    })

    it('should update purchased status', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ purchased: true })

      expect(res.status).toBe(200)
      expect(res.body.purchased).toBe(1)
    })

    it('should toggle purchased status back to false', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ purchased: true })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ purchased: false })

      expect(res.status).toBe(200)
      expect(res.body.purchased).toBe(0)
    })

    it('should update stock', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk', stock: 2 })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ stock: 5 })

      expect(res.status).toBe(200)
      expect(res.body.stock).toBe(5)
    })

    it('should return 400 when updating with empty name', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ name: '' })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('必須')
    })

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .put('/api/items/99999')
        .send({ name: 'milk' })

      expect(res.status).toBe(404)
      expect(res.body.error).toContain('見つかりません')
    })

    it('should preserve unchanged fields', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk', quantity: 3, memo: 'memo text' })

      const res = await request(app)
        .put(`/api/items/${createRes.body.id}`)
        .send({ priority: 'high' })

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('milk')
      expect(res.body.quantity).toBe(3)
      expect(res.body.memo).toBe('memo text')
      expect(res.body.priority).toBe('high')
    })
  })

  describe('DELETE /api/items/:id', () => {
    it('should delete an item', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'milk' })

      const deleteRes = await request(app)
        .delete(`/api/items/${createRes.body.id}`)

      expect(deleteRes.status).toBe(204)

      const getRes = await request(app).get(`/api/items/${createRes.body.id}`)
      expect(getRes.status).toBe(404)
    })

    it('should return 404 for non-existent item', async () => {
      const res = await request(app).delete('/api/items/99999')

      expect(res.status).toBe(404)
      expect(res.body.error).toContain('見つかりません')
    })
  })

  describe('GET /api/items/stats', () => {
    beforeEach(async () => {
      await request(app).post('/api/items').send({ name: 'milk', stock: 0 })
      await request(app).post('/api/items').send({ name: 'bread', stock: 5 })
      await request(app).post('/api/items').send({ name: 'soap', stock: 1 })
    })

    it('should return correct total count', async () => {
      const res = await request(app).get('/api/items/stats')

      expect(res.status).toBe(200)
      expect(res.body.total).toBe(3)
    })

    it('should return correct purchased count', async () => {
      const items = await request(app).get('/api/items')
      await request(app)
        .put(`/api/items/${items.body[0].id}`)
        .send({ purchased: true })

      const res = await request(app).get('/api/items/stats')

      expect(res.status).toBe(200)
      expect(res.body.purchased).toBe(1)
      expect(res.body.remaining).toBe(2)
    })

    it('should count low stock items', async () => {
      const res = await request(app).get('/api/items/stats')

      expect(res.status).toBe(200)
      expect(res.body.lowStock).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters in name', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: "Test's item (special)" })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe("Test's item (special)")
    })

    it('should handle very long name', async () => {
      const longName = 'a'.repeat(1000)
      const res = await request(app)
        .post('/api/items')
        .send({ name: longName })

      expect(res.status).toBe(201)
      expect(res.body.name).toBe(longName)
    })
  })
})
