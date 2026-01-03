<script setup>
import { ref, computed } from 'vue'
import { CATEGORIES, PRIORITIES } from '../composables/useApi'

const emit = defineEmits(['submit'])

const name = ref('')
const quantity = ref(1)
const stock = ref(0)
const memo = ref('')
const category = ref('food')
const priority = ref('medium')
const deadline = ref('')
const isExpanded = ref(false)

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

function handleSubmit() {
  if (!name.value.trim()) {
    return
  }
  emit('submit', {
    name: name.value.trim(),
    quantity: quantity.value,
    stock: stock.value,
    memo: memo.value.trim() || null,
    category: category.value,
    priority: priority.value,
    deadline: deadline.value || null
  })
  // フォームリセット
  name.value = ''
  quantity.value = 1
  stock.value = 0
  memo.value = ''
  category.value = 'food'
  priority.value = 'medium'
  deadline.value = ''
}
</script>

<template>
  <div class="item-form-container">
    <form @submit.prevent="handleSubmit" class="item-form">
      <div class="form-main">
        <div class="input-with-icon">
          <span class="input-icon" aria-hidden="true">🛒</span>
          <input
            v-model="name"
            type="text"
            placeholder="商品名を入力..."
            class="main-input"
            required
            aria-label="商品名"
            aria-required="true"
            id="item-name-input"
          />
        </div>
        <button
          type="submit"
          class="submit-btn"
          :disabled="!name.trim()"
          aria-label="商品を追加"
        >
          <span>追加</span>
        </button>
      </div>

      <button
        type="button"
        class="toggle-details"
        @click="isExpanded = !isExpanded"
        :aria-expanded="isExpanded"
        aria-controls="item-details"
      >
        <span>{{ isExpanded ? '詳細を閉じる' : '詳細を設定' }}</span>
        <span class="toggle-icon" aria-hidden="true">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>

      <Transition name="slide">
        <div v-if="isExpanded" id="item-details" class="form-details" role="region" aria-label="商品の詳細設定">
          <div class="form-row">
            <div class="form-group">
              <label id="category-label">カテゴリ</label>
              <div class="category-buttons" role="radiogroup" aria-labelledby="category-label">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.value"
                  type="button"
                  role="radio"
                  :aria-checked="category === cat.value"
                  :class="['category-btn', { active: category === cat.value }]"
                  :style="category === cat.value ? { background: cat.color, borderColor: cat.color } : {}"
                  @click="category = cat.value"
                >
                  <span class="cat-icon" aria-hidden="true">{{ cat.icon }}</span>
                  <span class="cat-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label id="priority-label">優先度</label>
              <div class="priority-buttons" role="radiogroup" aria-labelledby="priority-label">
                <button
                  v-for="p in PRIORITIES"
                  :key="p.value"
                  type="button"
                  role="radio"
                  :aria-checked="priority === p.value"
                  :class="['priority-btn', { active: priority === p.value }]"
                  :style="priority === p.value ? { background: p.color, borderColor: p.color } : {}"
                  @click="priority = p.value"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="deadline-input">購入期限</label>
              <input
                id="deadline-input"
                v-model="deadline"
                type="date"
                :min="minDate"
                class="date-input"
                aria-label="購入期限"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group small">
              <label for="quantity-input">購入数</label>
              <div class="number-input" role="spinbutton" :aria-valuenow="quantity" aria-valuemin="1" aria-label="購入数">
                <button type="button" @click="quantity = Math.max(1, quantity - 1)" aria-label="購入数を減らす">−</button>
                <input id="quantity-input" v-model.number="quantity" type="number" min="1" aria-label="購入数" />
                <button type="button" @click="quantity++" aria-label="購入数を増やす">+</button>
              </div>
            </div>

            <div class="form-group small">
              <label for="stock-input">現在の在庫</label>
              <div class="number-input" role="spinbutton" :aria-valuenow="stock" aria-valuemin="0" aria-label="現在の在庫">
                <button type="button" @click="stock = Math.max(0, stock - 1)" aria-label="在庫を減らす">−</button>
                <input id="stock-input" v-model.number="stock" type="number" min="0" aria-label="現在の在庫" />
                <button type="button" @click="stock++" aria-label="在庫を増やす">+</button>
              </div>
            </div>

            <div class="form-group flex-1">
              <label for="memo-input">メモ</label>
              <input
                id="memo-input"
                v-model="memo"
                type="text"
                placeholder="メモ（任意）"
                class="memo-input"
                aria-label="メモ"
              />
            </div>
          </div>
        </div>
      </Transition>
    </form>
  </div>
</template>

<style scoped>
.item-form-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 3px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.item-form {
  background: white;
  border-radius: 14px;
  padding: 20px;
}

.form-main {
  display: flex;
  gap: 12px;
}

.input-with-icon {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
}

.main-input {
  width: 100%;
  padding: 16px 16px 16px 50px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

.main-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-details:hover {
  background: #eee;
}

.toggle-icon {
  font-size: 10px;
}

.form-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.small {
  width: 120px;
}

.form-group.flex-1 {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #eee;
}

.category-btn.active {
  color: white;
}

.cat-icon {
  font-size: 16px;
}

.cat-label {
  font-size: 13px;
  font-weight: 500;
}

.priority-buttons {
  display: flex;
  gap: 8px;
}

.priority-btn {
  padding: 8px 20px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.priority-btn:hover {
  background: #eee;
}

.priority-btn.active {
  color: white;
}

.date-input {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

.number-input {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.number-input button {
  padding: 10px 14px;
  background: #f5f5f5;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.number-input button:hover {
  background: #e0e0e0;
}

.number-input input {
  width: 50px;
  padding: 10px;
  border: none;
  text-align: center;
  font-size: 14px;
}

.number-input input:focus {
  outline: none;
}

.memo-input {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.memo-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
