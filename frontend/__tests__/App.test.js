import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

// Create mock functions at module level so they can be tracked
const mockGetItems = vi.fn().mockResolvedValue([])
const mockGetStats = vi.fn().mockResolvedValue({
  total: 5,
  remaining: 3,
  purchased: 2,
  lowStock: 1,
  urgent: 0
})
const mockCreateItem = vi.fn().mockResolvedValue({ id: 1, name: 'Test' })
const mockUpdateItem = vi.fn().mockResolvedValue({ id: 1, name: 'Updated' })
const mockDeleteItem = vi.fn().mockResolvedValue(undefined)
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

// Mock useApi composable
vi.mock('../src/composables/useApi', () => ({
  useApi: () => ({
    loading: ref(false),
    error: ref(null),
    getItems: mockGetItems,
    getStats: mockGetStats,
    createItem: mockCreateItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem
  }),
  CATEGORIES: [
    { value: 'food', label: '食品', icon: '🍎', color: '#ff6b6b' },
    { value: 'daily', label: '日用品', icon: '🧴', color: '#4ecdc4' },
    { value: 'drink', label: '飲料', icon: '🥤', color: '#45b7d1' },
    { value: 'snack', label: 'お菓子', icon: '🍪', color: '#f7dc6f' },
    { value: 'frozen', label: '冷凍食品', icon: '🧊', color: '#a29bfe' },
    { value: 'other', label: 'その他', icon: '📦', color: '#636e72' }
  ],
  PRIORITIES: [
    { value: 'high', label: '高', color: '#e74c3c' },
    { value: 'medium', label: '中', color: '#f39c12' },
    { value: 'low', label: '低', color: '#27ae60' }
  ]
}))

// Mock useToast composable
vi.mock('../src/composables/useToast', () => ({
  useToast: () => ({
    toasts: ref([]),
    success: mockToastSuccess,
    error: mockToastError,
    info: vi.fn(),
    remove: vi.fn()
  })
}))

// Import App after mocks are set up
import App from '../src/App.vue'

describe('App', () => {
  let wrapper

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Restore default mock implementations
    mockGetItems.mockResolvedValue([])
    mockGetStats.mockResolvedValue({
      total: 5,
      remaining: 3,
      purchased: 2,
      lowStock: 1,
      urgent: 0
    })
    mockCreateItem.mockResolvedValue({ id: 1, name: 'Test' })
    mockUpdateItem.mockResolvedValue({ id: 1, name: 'Updated' })
    mockDeleteItem.mockResolvedValue(undefined)

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render header with title', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.find('header h1').text()).toBe('お買い物リスト')
    })

    it('should render logo', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.find('.logo').text()).toBe('🛒')
    })

    it('should render StatsPanel component', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.findComponent({ name: 'StatsPanel' }).exists()).toBe(true)
    })

    it('should render ItemForm component', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.findComponent({ name: 'ItemForm' }).exists()).toBe(true)
    })

    it('should render FilterBar component', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.findComponent({ name: 'FilterBar' }).exists()).toBe(true)
    })

    it('should render ItemList component', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.findComponent({ name: 'ItemList' }).exists()).toBe(true)
    })

    it('should render footer', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(wrapper.find('footer').text()).toContain('Made with Vue 3 + Vite')
    })
  })

  describe('initial data loading', () => {
    it('should load items on mount', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(mockGetItems).toHaveBeenCalled()
    })

    it('should load stats on mount', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      expect(mockGetStats).toHaveBeenCalled()
    })
  })

  describe('filter functionality', () => {
    it('should pass filters to FilterBar', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const filterBar = wrapper.findComponent({ name: 'FilterBar' })
      expect(filterBar.props('modelValue')).toMatchObject({
        search: '',
        category: 'all',
        priority: 'all',
        purchased: 'all',
        sort: 'created_at',
        order: 'desc'
      })
    })
  })

  describe('item form submission', () => {
    it('should call createItem when form is submitted', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemForm = wrapper.findComponent({ name: 'ItemForm' })
      await itemForm.vm.$emit('submit', { name: 'New Item', quantity: 1 })
      await flushPromises()

      expect(mockCreateItem).toHaveBeenCalledWith({ name: 'New Item', quantity: 1 })
    })

    it('should show success toast on successful add', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemForm = wrapper.findComponent({ name: 'ItemForm' })
      await itemForm.vm.$emit('submit', { name: 'New Item' })
      await flushPromises()

      expect(mockToastSuccess).toHaveBeenCalledWith('商品を追加しました')
    })
  })

  describe('item operations', () => {
    it('should call updateItem when toggle-purchased is emitted', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('toggle-purchased', { id: 1, name: 'Test', purchased: false })
      await flushPromises()

      expect(mockUpdateItem).toHaveBeenCalledWith(1, { purchased: true })
    })

    it('should call updateItem when update-stock is emitted', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('update-stock', { id: 1, name: 'Test', stock: 2 }, 3)
      await flushPromises()

      expect(mockUpdateItem).toHaveBeenCalledWith(1, { stock: 3 })
    })

    it('should call deleteItem when delete is emitted and confirmed', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('delete', { id: 1, name: 'Test' })
      await flushPromises()

      expect(window.confirm).toHaveBeenCalledWith('「Test」を削除しますか？')
      expect(mockDeleteItem).toHaveBeenCalledWith(1)
    })

    it('should not delete when confirm is cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('delete', { id: 1, name: 'Test' })
      await flushPromises()

      expect(mockDeleteItem).not.toHaveBeenCalled()
    })

    it('should show success toast on delete', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('delete', { id: 1, name: 'Test' })
      await flushPromises()

      expect(mockToastSuccess).toHaveBeenCalledWith('商品を削除しました')
    })
  })

  describe('edit modal', () => {
    it('should open edit modal when edit is emitted', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('edit', { id: 1, name: 'Test Item' })
      await flushPromises()

      const editModal = wrapper.findComponent({ name: 'EditModal' })
      expect(editModal.props('show')).toBe(true)
      expect(editModal.props('item')).toMatchObject({ id: 1, name: 'Test Item' })
    })

    it('should close edit modal when close is emitted', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      // Open modal first
      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('edit', { id: 1, name: 'Test Item' })
      await flushPromises()

      // Close modal
      const editModal = wrapper.findComponent({ name: 'EditModal' })
      await editModal.vm.$emit('close')
      await flushPromises()

      expect(editModal.props('show')).toBe(false)
    })

    it('should call updateItem when save is emitted from modal', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      // Open modal
      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('edit', { id: 1, name: 'Test Item' })
      await flushPromises()

      // Save changes
      const editModal = wrapper.findComponent({ name: 'EditModal' })
      await editModal.vm.$emit('save', { name: 'Updated Item', quantity: 5 })
      await flushPromises()

      expect(mockUpdateItem).toHaveBeenCalledWith(1, { name: 'Updated Item', quantity: 5 })
    })

    it('should show success toast on save', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      // Open modal
      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('edit', { id: 1, name: 'Test Item' })
      await flushPromises()

      // Save changes
      const editModal = wrapper.findComponent({ name: 'EditModal' })
      await editModal.vm.$emit('save', { name: 'Updated Item' })
      await flushPromises()

      expect(mockToastSuccess).toHaveBeenCalledWith('商品を更新しました')
    })
  })

  describe('loading and error states', () => {
    it('should pass loading state to ItemForm', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemForm = wrapper.findComponent({ name: 'ItemForm' })
      expect(itemForm.props('loading')).toBe(false)
    })

    it('should pass processingIds to ItemList', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      expect(itemList.props('processingIds')).toBeInstanceOf(Set)
    })

    it('should pass loading state to EditModal', async () => {
      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      // Open modal
      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('edit', { id: 1, name: 'Test Item' })
      await flushPromises()

      const editModal = wrapper.findComponent({ name: 'EditModal' })
      expect(editModal.props('loading')).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should show error toast when add fails', async () => {
      mockCreateItem.mockRejectedValueOnce(new Error('Failed'))

      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemForm = wrapper.findComponent({ name: 'ItemForm' })
      await itemForm.vm.$emit('submit', { name: 'New Item' })
      await flushPromises()

      expect(mockToastError).toHaveBeenCalledWith('商品の追加に失敗しました')
    })

    it('should show error toast when toggle purchased fails', async () => {
      mockUpdateItem.mockRejectedValueOnce(new Error('Failed'))

      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('toggle-purchased', { id: 1, purchased: false })
      await flushPromises()

      expect(mockToastError).toHaveBeenCalledWith('更新に失敗しました')
    })

    it('should show error toast when delete fails', async () => {
      mockDeleteItem.mockRejectedValueOnce(new Error('Failed'))

      wrapper = mount(App, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      await flushPromises()

      const itemList = wrapper.findComponent({ name: 'ItemList' })
      await itemList.vm.$emit('delete', { id: 1, name: 'Test' })
      await flushPromises()

      expect(mockToastError).toHaveBeenCalledWith('削除に失敗しました')
    })
  })
})
