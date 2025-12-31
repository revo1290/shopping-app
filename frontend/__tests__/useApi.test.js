import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApi, CATEGORIES, PRIORITIES } from '../src/composables/useApi.js'

describe('useApi', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('getItems', () => {
    it('should fetch items successfully', async () => {
      const mockItems = [
        { id: 1, name: 'Milk', quantity: 2, purchased: 0 },
        { id: 2, name: 'Bread', quantity: 1, purchased: 0 }
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })

      const { getItems, loading, error } = useApi()
      const result = await getItems()

      expect(global.fetch).toHaveBeenCalledWith('/api/items')
      expect(result).toEqual(mockItems)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should build query string with filters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      })

      const { getItems } = useApi()
      await getItems({
        search: 'milk',
        category: 'food',
        priority: 'high',
        purchased: 0,
        sort: 'name',
        order: 'asc'
      })

      const calledUrl = global.fetch.mock.calls[0][0]
      expect(calledUrl).toContain('search=milk')
      expect(calledUrl).toContain('category=food')
      expect(calledUrl).toContain('priority=high')
      expect(calledUrl).toContain('purchased=0')
      expect(calledUrl).toContain('sort=name')
      expect(calledUrl).toContain('order=asc')
    })

    it('should set error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })

      const { getItems, error } = useApi()

      await expect(getItems()).rejects.toThrow('商品の取得に失敗しました')
      expect(error.value).toBe('商品の取得に失敗しました')
    })

    it('should handle network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { getItems, error } = useApi()

      await expect(getItems()).rejects.toThrow('Network error')
      expect(error.value).toBe('Network error')
    })
  })

  describe('getItem', () => {
    it('should fetch single item by id', async () => {
      const mockItem = { id: 1, name: 'Milk', quantity: 2, purchased: 0 }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockItem)
      })

      const { getItem } = useApi()
      const result = await getItem(1)

      expect(global.fetch).toHaveBeenCalledWith('/api/items/1')
      expect(result).toEqual(mockItem)
    })

    it('should throw error when item not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      const { getItem, error } = useApi()

      await expect(getItem(999)).rejects.toThrow('商品の取得に失敗しました')
      expect(error.value).toBe('商品の取得に失敗しました')
    })
  })

  describe('getStats', () => {
    it('should fetch statistics successfully', async () => {
      const mockStats = {
        total: 10,
        purchased: 3,
        unpurchased: 7,
        byCategory: { food: 5, daily: 3 }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })

      const { getStats } = useApi()
      const result = await getStats()

      expect(global.fetch).toHaveBeenCalledWith('/api/items/stats')
      expect(result).toEqual(mockStats)
    })

    it('should return null on error without throwing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { getStats } = useApi()
      const result = await getStats()

      expect(result).toBe(null)
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })
  })

  describe('createItem', () => {
    it('should create item successfully', async () => {
      const newItem = { name: 'Eggs', quantity: 12, category: 'food' }
      const createdItem = { id: 1, ...newItem, purchased: 0 }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createdItem)
      })

      const { createItem, loading } = useApi()
      const result = await createItem(newItem)

      expect(global.fetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })
      expect(result).toEqual(createdItem)
      expect(loading.value).toBe(false)
    })

    it('should throw error with server message on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Name is required' })
      })

      const { createItem, error } = useApi()

      await expect(createItem({})).rejects.toThrow('Name is required')
      expect(error.value).toBe('Name is required')
    })

    it('should use default error message when server error is empty', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      })

      const { createItem, error } = useApi()

      await expect(createItem({})).rejects.toThrow('商品の登録に失敗しました')
      expect(error.value).toBe('商品の登録に失敗しました')
    })
  })

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const updates = { purchased: 1 }
      const updatedItem = { id: 1, name: 'Milk', purchased: 1 }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedItem)
      })

      const { updateItem } = useApi()
      const result = await updateItem(1, updates)

      expect(global.fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      expect(result).toEqual(updatedItem)
    })

    it('should throw error on update failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Item not found' })
      })

      const { updateItem, error } = useApi()

      await expect(updateItem(999, {})).rejects.toThrow('Item not found')
      expect(error.value).toBe('Item not found')
    })
  })

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })

      const { deleteItem, loading, error } = useApi()
      await deleteItem(1)

      expect(global.fetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'DELETE'
      })
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should throw error on delete failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      const { deleteItem, error } = useApi()

      await expect(deleteItem(999)).rejects.toThrow('商品の削除に失敗しました')
      expect(error.value).toBe('商品の削除に失敗しました')
    })
  })

  describe('loading state', () => {
    it('should set loading true during request and false after', async () => {
      let resolvePromise
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      const { getItems, loading } = useApi()
      expect(loading.value).toBe(false)

      const promise = getItems()
      expect(loading.value).toBe(true)

      resolvePromise({
        ok: true,
        json: () => Promise.resolve([])
      })

      await promise
      expect(loading.value).toBe(false)
    })
  })
})

describe('CATEGORIES', () => {
  it('should have 6 categories with required properties', () => {
    expect(CATEGORIES).toHaveLength(6)

    CATEGORIES.forEach(category => {
      expect(category).toHaveProperty('value')
      expect(category).toHaveProperty('label')
      expect(category).toHaveProperty('icon')
      expect(category).toHaveProperty('color')
      expect(typeof category.value).toBe('string')
      expect(typeof category.label).toBe('string')
      expect(typeof category.color).toBe('string')
    })
  })

  it('should contain expected category values', () => {
    const values = CATEGORIES.map(c => c.value)
    expect(values).toContain('food')
    expect(values).toContain('daily')
    expect(values).toContain('drink')
    expect(values).toContain('snack')
    expect(values).toContain('frozen')
    expect(values).toContain('other')
  })
})

describe('PRIORITIES', () => {
  it('should have 3 priorities with required properties', () => {
    expect(PRIORITIES).toHaveLength(3)

    PRIORITIES.forEach(priority => {
      expect(priority).toHaveProperty('value')
      expect(priority).toHaveProperty('label')
      expect(priority).toHaveProperty('color')
    })
  })

  it('should contain expected priority values', () => {
    const values = PRIORITIES.map(p => p.value)
    expect(values).toContain('high')
    expect(values).toContain('medium')
    expect(values).toContain('low')
  })
})
