<script setup>
import { CATEGORIES, PRIORITIES } from '../composables/useApi'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  processingIds: {
    type: Set,
    default: () => new Set()
  }
})

function isProcessing(itemId) {
  return props.processingIds.has(itemId)
}

const emit = defineEmits(['toggle-purchased', 'delete', 'update-stock', 'edit'])

function getCategoryInfo(categoryValue) {
  return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[5]
}

function getPriorityInfo(priorityValue) {
  return PRIORITIES.find(p => p.value === priorityValue) || PRIORITIES[1]
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: '期限切れ', class: 'overdue' }
  if (diffDays === 0) return { text: '今日', class: 'today' }
  if (diffDays === 1) return { text: '明日', class: 'tomorrow' }
  if (diffDays <= 3) return { text: `${diffDays}日後`, class: 'soon' }
  const date = new Date(dateStr)
  return { text: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }), class: '' }
}

function isLowStock(item) {
  return item.stock <= 1 && !item.purchased
}
</script>

<template>
  <div class="item-list">
    <TransitionGroup name="list" tag="ul">
      <li
        v-for="item in items"
        :key="item.id"
        :class="['item-card', { purchased: item.purchased, 'low-stock': isLowStock(item), processing: isProcessing(item.id) }]"
      >
        <div v-if="isProcessing(item.id)" class="processing-overlay">
          <LoadingSpinner size="medium" />
        </div>
        <div class="item-checkbox">
          <input
            type="checkbox"
            :id="'item-' + item.id"
            :checked="item.purchased"
            @change="emit('toggle-purchased', item)"
          />
          <label :for="'item-' + item.id" class="checkbox-label"></label>
        </div>

        <div class="item-content" @click="emit('edit', item)">
          <div class="item-header">
            <span class="category-badge" :style="{ background: getCategoryInfo(item.category).color }">
              {{ getCategoryInfo(item.category).icon }}
            </span>
            <span class="item-name">{{ item.name }}</span>
            <span
              class="priority-badge"
              :style="{ background: getPriorityInfo(item.priority).color }"
            >
              {{ getPriorityInfo(item.priority).label }}
            </span>
          </div>

          <div class="item-meta">
            <div class="meta-item quantity">
              <span class="meta-icon">📦</span>
              <span>購入: {{ item.quantity }}個</span>
            </div>

            <div class="meta-item stock" :class="{ warning: isLowStock(item) }">
              <span class="meta-icon">🏠</span>
              <span>在庫: {{ item.stock }}個</span>
              <div class="stock-controls" @click.stop>
                <button @click="emit('update-stock', item, item.stock - 1)" :disabled="item.stock <= 0">−</button>
                <button @click="emit('update-stock', item, item.stock + 1)">+</button>
              </div>
            </div>

            <div v-if="item.deadline" class="meta-item deadline" :class="formatDate(item.deadline)?.class">
              <span class="meta-icon">📅</span>
              <span>{{ formatDate(item.deadline)?.text }}</span>
            </div>

            <div v-if="item.memo" class="meta-item memo">
              <span class="meta-icon">📝</span>
              <span>{{ item.memo }}</span>
            </div>
          </div>
        </div>

        <div class="item-actions">
          <button class="edit-btn" @click="emit('edit', item)" title="編集">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="delete-btn" @click="emit('delete', item)" title="削除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </li>
    </TransitionGroup>

    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">🛒</div>
      <p class="empty-title">商品が見つかりません</p>
      <p class="empty-text">上のフォームから商品を追加するか、検索条件を変更してください</p>
    </div>
  </div>
</template>

<style scoped>
.item-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.item-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.item-card.processing {
  pointer-events: none;
  position: relative;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
  color: #667eea;
}

.item-card.purchased {
  background: #f8f9fa;
  opacity: 0.7;
}

.item-card.purchased .item-name {
  text-decoration: line-through;
  color: #999;
}

.item-card.low-stock {
  border-color: #ffcdd2;
  background: #fff8f8;
}

/* Checkbox styling */
.item-checkbox {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 4px;
}

.item-checkbox input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.checkbox-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s;
}

.item-checkbox input:checked + .checkbox-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.item-checkbox input:checked + .checkbox-label::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.item-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.category-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 14px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 6px;
}

.meta-icon {
  font-size: 12px;
}

.meta-item.warning {
  background: #ffebee;
  color: #c62828;
}

.meta-item.deadline.overdue {
  background: #ffebee;
  color: #c62828;
}

.meta-item.deadline.today {
  background: #fff3e0;
  color: #e65100;
}

.meta-item.deadline.tomorrow {
  background: #fff8e1;
  color: #f57f17;
}

.meta-item.deadline.soon {
  background: #e3f2fd;
  color: #1565c0;
}

.stock-controls {
  display: flex;
  gap: 2px;
  margin-left: 4px;
}

.stock-controls button {
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.stock-controls button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.2);
}

.stock-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.edit-btn,
.delete-btn {
  padding: 8px;
  background: transparent;
  border: none;
  color: #bbb;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.delete-btn:hover {
  background: #ffebee;
  color: #e53935;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
