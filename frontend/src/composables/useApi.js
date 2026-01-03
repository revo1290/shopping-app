import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// リトライ設定
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1秒

/**
 * 遅延を挟んで待機
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * リトライ可能なエラーかどうかを判定
 */
function isRetryableError(error) {
  // ネットワークエラーの場合はリトライ可能
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return true
  }
  // サーバーエラー（500系）の場合もリトライ可能
  if (error.status && error.status >= 500) {
    return true
  }
  return false
}

/**
 * エラーの種類を判定してメッセージを生成
 */
function parseError(error, response) {
  // オフライン
  if (!navigator.onLine) {
    return {
      type: 'offline',
      message: 'インターネットに接続されていません',
      details: 'ネットワーク接続を確認してください'
    }
  }

  // ネットワークエラー
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return {
      type: 'network',
      message: 'サーバーに接続できません',
      details: 'サーバーが起動していることを確認してください'
    }
  }

  // HTTPエラー
  if (response) {
    const status = response.status
    if (status === 400) {
      return {
        type: 'validation',
        message: error.message || '入力内容に問題があります',
        details: error.details || null
      }
    }
    if (status === 404) {
      return {
        type: 'not_found',
        message: '指定されたデータが見つかりません',
        details: null
      }
    }
    if (status >= 500) {
      return {
        type: 'server',
        message: 'サーバーエラーが発生しました',
        details: 'しばらく待ってから再度お試しください'
      }
    }
  }

  // その他のエラー
  return {
    type: 'unknown',
    message: error.message || '予期しないエラーが発生しました',
    details: null
  }
}

/**
 * fetch APIを使用したAPI通信composable
 */
export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const errorDetails = ref(null)

  /**
   * リトライ付きfetch
   */
  async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    let lastError = null
    let response = null

    for (let i = 0; i < retries; i++) {
      try {
        response = await fetch(url, options)
        if (response.ok) {
          return response
        }
        // 4xx エラーはリトライしない
        if (response.status >= 400 && response.status < 500) {
          break
        }
        // 5xx エラーは最後のリトライまで続ける
        lastError = new Error(`HTTP ${response.status}`)
        lastError.status = response.status
      } catch (e) {
        lastError = e
        if (!isRetryableError(e)) {
          break
        }
      }

      // 最後の試行でなければ待機してリトライ
      if (i < retries - 1) {
        await delay(RETRY_DELAY * (i + 1)) // 指数バックオフ
      }
    }

    // 最終的なエラー処理
    if (response && !response.ok) {
      const parsed = parseError(lastError || {}, response)
      error.value = parsed.message
      errorDetails.value = parsed
      const err = new Error(parsed.message)
      err.parsed = parsed
      throw err
    }

    if (lastError) {
      const parsed = parseError(lastError, null)
      error.value = parsed.message
      errorDetails.value = parsed
      const err = new Error(parsed.message)
      err.parsed = parsed
      throw err
    }

    return response
  }

  /**
   * 商品一覧を取得（検索・フィルター・ソート対応）
   */
  async function getItems(filters = {}) {
    loading.value = true
    error.value = null
    errorDetails.value = null
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.purchased !== undefined) params.append('purchased', filters.purchased)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.order) params.append('order', filters.order)

      const url = `${API_BASE}/items${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetchWithRetry(url)
      return await response.json()
    } catch (e) {
      if (!e.parsed) {
        const parsed = parseError(e, null)
        error.value = parsed.message
        errorDetails.value = parsed
      }
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
    errorDetails.value = null
    try {
      const response = await fetchWithRetry(`${API_BASE}/items/${id}`)
      return await response.json()
    } catch (e) {
      if (!e.parsed) {
        const parsed = parseError(e, null)
        error.value = parsed.message
        errorDetails.value = parsed
      }
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
      const response = await fetchWithRetry(`${API_BASE}/items/stats`)
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
    errorDetails.value = null
    let response = null
    try {
      response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
      if (!response.ok) {
        const data = await response.json()
        const parsed = parseError({ message: data.error }, response)
        error.value = parsed.message
        errorDetails.value = parsed
        const err = new Error(parsed.message)
        err.parsed = parsed
        throw err
      }
      return await response.json()
    } catch (e) {
      if (!e.parsed) {
        const parsed = parseError(e, response)
        error.value = parsed.message
        errorDetails.value = parsed
      }
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
    errorDetails.value = null
    let response = null
    try {
      response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) {
        const data = await response.json()
        const parsed = parseError({ message: data.error }, response)
        error.value = parsed.message
        errorDetails.value = parsed
        const err = new Error(parsed.message)
        err.parsed = parsed
        throw err
      }
      return await response.json()
    } catch (e) {
      if (!e.parsed) {
        const parsed = parseError(e, response)
        error.value = parsed.message
        errorDetails.value = parsed
      }
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
    errorDetails.value = null
    let response = null
    try {
      response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const parsed = parseError({ message: '商品の削除に失敗しました' }, response)
        error.value = parsed.message
        errorDetails.value = parsed
        const err = new Error(parsed.message)
        err.parsed = parsed
        throw err
      }
    } catch (e) {
      if (!e.parsed) {
        const parsed = parseError(e, response)
        error.value = parsed.message
        errorDetails.value = parsed
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    errorDetails,
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
