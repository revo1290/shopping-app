<script setup>
import { ref, watch, computed } from 'vue'
import { CATEGORIES, PRIORITIES } from '../composables/useApi'

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  quantity: 1,
  stock: 0,
  memo: '',
  category: 'food',
  priority: 'medium',
  deadline: ''
})

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      name: newItem.name || '',
      quantity: newItem.quantity || 1,
      stock: newItem.stock || 0,
      memo: newItem.memo || '',
      category: newItem.category || 'food',
      priority: newItem.priority || 'medium',
      deadline: newItem.deadline || ''
    }
  }
}, { immediate: true })

function handleSubmit() {
  if (!form.value.name.trim()) {
    return
  }
  emit('save', {
    ...form.value,
    name: form.value.name.trim(),
    memo: form.value.memo.trim() || null,
    deadline: form.value.deadline || null
  })
}

function handleClose() {
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-container">
          <div class="modal-header">
            <h2>商品を編集</h2>
            <button class="close-btn" @click="handleClose">×</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label>商品名 *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="商品名を入力"
                required
              />
            </div>

            <div class="form-group">
              <label>カテゴリ</label>
              <div class="category-buttons">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.value"
                  type="button"
                  :class="['category-btn', { active: form.category === cat.value }]"
                  :style="form.category === cat.value ? { background: cat.color, borderColor: cat.color } : {}"
                  @click="form.category = cat.value"
                >
                  <span class="cat-icon">{{ cat.icon }}</span>
                  <span class="cat-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>優先度</label>
                <div class="priority-buttons">
                  <button
                    v-for="p in PRIORITIES"
                    :key="p.value"
                    type="button"
                    :class="['priority-btn', { active: form.priority === p.value }]"
                    :style="form.priority === p.value ? { background: p.color, borderColor: p.color } : {}"
                    @click="form.priority = p.value"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>購入期限</label>
                <input
                  v-model="form.deadline"
                  type="date"
                  :min="minDate"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group small">
                <label>購入数</label>
                <div class="number-input">
                  <button type="button" @click="form.quantity = Math.max(1, form.quantity - 1)">−</button>
                  <input v-model.number="form.quantity" type="number" min="1" />
                  <button type="button" @click="form.quantity++">+</button>
                </div>
              </div>

              <div class="form-group small">
                <label>現在の在庫</label>
                <div class="number-input">
                  <button type="button" @click="form.stock = Math.max(0, form.stock - 1)">−</button>
                  <input v-model.number="form.stock" type="number" min="0" />
                  <button type="button" @click="form.stock++">+</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>メモ</label>
              <textarea
                v-model="form.memo"
                placeholder="メモ（任意）"
                rows="3"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="cancel-btn" @click="handleClose">キャンセル</button>
              <button type="submit" class="save-btn" :disabled="!form.name.trim()">保存</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #eee;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.form-group.small {
  width: 140px;
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
  font-size: 14px;
}

.cat-label {
  font-size: 12px;
  font-weight: 500;
}

.priority-buttons {
  display: flex;
  gap: 8px;
}

.priority-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 20px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.priority-btn:hover {
  background: #eee;
}

.priority-btn.active {
  color: white;
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

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

.cancel-btn {
  padding: 12px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #eee;
}

.save-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-20px);
}
</style>
