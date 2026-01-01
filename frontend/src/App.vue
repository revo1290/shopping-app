<script setup>
import { ref, onMounted, watch } from 'vue'
import { useApi } from './composables/useApi'
import { useToast } from './composables/useToast'
import ItemForm from './components/ItemForm.vue'
import ItemList from './components/ItemList.vue'
import StatsPanel from './components/StatsPanel.vue'
import FilterBar from './components/FilterBar.vue'
import EditModal from './components/EditModal.vue'
import ToastContainer from './components/ToastContainer.vue'

const { loading, error, getItems, getStats, createItem, updateItem, deleteItem } = useApi()
const toast = useToast()

const items = ref([])
const stats = ref(null)
const filters = ref({
  search: '',
  category: 'all',
  priority: 'all',
  purchased: 'all',
  sort: 'created_at',
  order: 'desc'
})

// 編集モーダル
const showEditModal = ref(false)
const editingItem = ref(null)

async function loadItems() {
  try {
    items.value = await getItems(filters.value)
  } catch (e) {
    console.error('Failed to load items:', e)
  }
}

async function loadStats() {
  stats.value = await getStats()
}

async function loadAll() {
  await Promise.all([loadItems(), loadStats()])
}

async function handleAddItem(item) {
  try {
    await createItem(item)
    await loadAll()
    toast.success('商品を追加しました')
  } catch (e) {
    console.error('Failed to add item:', e)
    toast.error('商品の追加に失敗しました')
  }
}

async function handleTogglePurchased(item) {
  try {
    await updateItem(item.id, { purchased: !item.purchased })
    await loadAll()
    toast.success(item.purchased ? '未購入に変更しました' : '購入済みにしました')
  } catch (e) {
    console.error('Failed to update item:', e)
    toast.error('更新に失敗しました')
  }
}

async function handleUpdateStock(item, newStock) {
  try {
    await updateItem(item.id, { stock: Math.max(0, newStock) })
    await loadAll()
  } catch (e) {
    console.error('Failed to update stock:', e)
    toast.error('在庫の更新に失敗しました')
  }
}

async function handleDeleteItem(item) {
  if (!confirm(`「${item.name}」を削除しますか？`)) {
    return
  }
  try {
    await deleteItem(item.id)
    await loadAll()
    toast.success('商品を削除しました')
  } catch (e) {
    console.error('Failed to delete item:', e)
    toast.error('削除に失敗しました')
  }
}

function handleEditItem(item) {
  editingItem.value = item
  showEditModal.value = true
}

async function handleSaveEdit(updates) {
  if (!editingItem.value) return

  try {
    await updateItem(editingItem.value.id, updates)
    showEditModal.value = false
    editingItem.value = null
    await loadAll()
    toast.success('商品を更新しました')
  } catch (e) {
    console.error('Failed to update item:', e)
    toast.error('更新に失敗しました')
  }
}

function handleCloseModal() {
  showEditModal.value = false
  editingItem.value = null
}

watch(filters, loadItems, { deep: true })

onMounted(loadAll)
</script>

<template>
  <div class="app">
    <header>
      <div class="logo">🛒</div>
      <h1>お買い物リスト</h1>
      <p class="subtitle">スマートに買い物を管理</p>
    </header>

    <main>
      <StatsPanel :stats="stats" />

      <ItemForm @submit="handleAddItem" />

      <FilterBar v-model="filters" />

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>読み込み中...</span>
      </div>

      <div v-else-if="error" class="error">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <ItemList
        :items="items"
        @toggle-purchased="handleTogglePurchased"
        @update-stock="handleUpdateStock"
        @delete="handleDeleteItem"
        @edit="handleEditItem"
      />
    </main>

    <footer>
      <p>Made with Vue 3 + Vite</p>
    </footer>

    <EditModal
      :show="showEditModal"
      :item="editingItem"
      @close="handleCloseModal"
      @save="handleSaveEdit"
    />

    <ToastContainer />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  margin-bottom: 8px;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

header h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.subtitle {
  color: #888;
  font-size: 14px;
}

main {
  flex: 1;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 12px;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 20px;
}

footer {
  text-align: center;
  padding: 24px;
  color: #aaa;
  font-size: 12px;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>
