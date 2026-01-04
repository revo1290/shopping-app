<script setup>
import { ref, watch } from 'vue'
import { CATEGORIES, PRIORITIES } from '../composables/useApi'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: '',
      category: 'all',
      priority: 'all',
      purchased: 'all',
      sort: 'created_at',
      order: 'desc'
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const searchInput = ref(props.modelValue.search || '')
let searchTimeout = null

// 検索入力のデバウンス処理
watch(searchInput, (value) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateFilter('search', value)
  }, 300)
})

function updateFilter(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const sortOptions = [
  { value: 'created_at', label: '登録日' },
  { value: 'deadline', label: '期限' },
  { value: 'priority', label: '優先度' },
  { value: 'name', label: '名前' },
  { value: 'stock', label: '在庫' }
]
</script>

<template>
  <div class="filter-bar" role="search" aria-label="商品フィルター">
    <div class="search-box">
      <span class="search-icon" aria-hidden="true">🔍</span>
      <input
        v-model="searchInput"
        type="search"
        placeholder="商品名・メモで検索..."
        class="search-input"
        aria-label="商品を検索"
      />
      <button
        v-if="searchInput"
        class="clear-search"
        @click="searchInput = ''"
        aria-label="検索をクリア"
      >
        ×
      </button>
    </div>

    <div class="filters" role="group" aria-label="フィルターオプション">
      <div class="filter-group">
        <label for="filter-category">カテゴリ</label>
        <select id="filter-category" :value="modelValue.category" @change="updateFilter('category', $event.target.value)">
          <option value="all">すべて</option>
          <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
            {{ cat.icon }} {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-priority">優先度</label>
        <select id="filter-priority" :value="modelValue.priority" @change="updateFilter('priority', $event.target.value)">
          <option value="all">すべて</option>
          <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-purchased">状態</label>
        <select id="filter-purchased" :value="modelValue.purchased" @change="updateFilter('purchased', $event.target.value)">
          <option value="all">すべて</option>
          <option value="false">未購入</option>
          <option value="true">購入済み</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-sort">並び替え</label>
        <div class="sort-controls">
          <select id="filter-sort" :value="modelValue.sort" @change="updateFilter('sort', $event.target.value)">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <button
            class="order-btn"
            @click="updateFilter('order', modelValue.order === 'asc' ? 'desc' : 'asc')"
            :aria-label="modelValue.order === 'asc' ? '降順に変更' : '昇順に変更'"
          >
            {{ modelValue.order === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  padding: 8px 0;
  border: none;
  font-size: 15px;
  background: transparent;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: #aaa;
}

.clear-search {
  width: 24px;
  height: 24px;
  border: none;
  background: #eee;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-search:hover {
  background: #ddd;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.sort-controls {
  display: flex;
  gap: 4px;
}

.sort-controls select {
  min-width: 100px;
}

.order-btn {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.order-btn:hover {
  border-color: #667eea;
  background: #f5f5ff;
}

@media (max-width: 600px) {
  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    width: 100%;
  }
}
</style>
