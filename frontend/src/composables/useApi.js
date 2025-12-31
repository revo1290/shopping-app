import { ref } from 'vue'

const API_BASE = '/api'

/**
 * fetch APIを使用したAPI通信composable
 */
export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * 商品一覧を取得（検索・フィルター・ソート対応）
   */
  async function getItems(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.purchased !== undefined) params.append('purchased', filters.purchased)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.order) params.append('order', filters.order)

      const url = `${API_BASE}/items${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('商品の取得に失敗しました')
      }
      return await response.json()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 商品詳細を取得
   */
  async function getItem(id) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/items/${id}`)
      if (!response.ok) {
        throw new Error('商品の取得に失敗しました')
      }
      return await response.json()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 統計情報を取得
   */
  async function getStats() {
    try {
      const response = await fetch(`${API_BASE}/items/stats`)
      if (!response.ok) {
        throw new Error('統計の取得に失敗しました')
      }
      return await response.json()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   * 商品を登録
   */
  async function createItem(item) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '商品の登録に失敗しました')
      }
      return await response.json()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 商品を更新
   */
  async function updateItem(id, updates) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '商品の更新に失敗しました')
      }
      return await response.json()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 商品を削除
   */
  async function deleteItem(id) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('商品の削除に失敗しました')
      }
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getItems,
    getItem,
    getStats,
    createItem,
    updateItem,
    deleteItem
  }
}

// カテゴリ定義
export const CATEGORIES = [
  { value: 'food', label: '食品', icon: '🍎', color: '#4CAF50' },
  { value: 'daily', label: '日用品', icon: '🧴', color: '#2196F3' },
  { value: 'drink', label: '飲料', icon: '🥤', color: '#00BCD4' },
  { value: 'snack', label: 'お菓子', icon: '🍪', color: '#FF9800' },
  { value: 'frozen', label: '冷凍食品', icon: '🧊', color: '#9C27B0' },
  { value: 'other', label: 'その他', icon: '📦', color: '#607D8B' }
]

// 優先度定義
export const PRIORITIES = [
  { value: 'high', label: '高', color: '#f44336' },
  { value: 'medium', label: '中', color: '#ff9800' },
  { value: 'low', label: '低', color: '#4caf50' }
]
