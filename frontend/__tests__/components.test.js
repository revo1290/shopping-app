import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ItemForm from '../src/components/ItemForm.vue'
import FilterBar from '../src/components/FilterBar.vue'

describe('ItemForm', () => {
  describe('rendering', () => {
    it('should render main input field', () => {
      const wrapper = mount(ItemForm)
      const input = wrapper.find('.main-input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toContain('商品名')
    })

    it('should render submit button', () => {
      const wrapper = mount(ItemForm)
      const button = wrapper.find('.submit-btn')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('追加')
    })

    it('should render toggle details button', () => {
      const wrapper = mount(ItemForm)
      const toggle = wrapper.find('.toggle-details')
      expect(toggle.exists()).toBe(true)
      expect(toggle.text()).toContain('詳細を設定')
    })

    it('should disable submit button when name is empty', () => {
      const wrapper = mount(ItemForm)
      const button = wrapper.find('.submit-btn')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('form expansion', () => {
    it('should not show details initially', () => {
      const wrapper = mount(ItemForm)
      expect(wrapper.find('.form-details').exists()).toBe(false)
    })

    it('should show details when toggle is clicked', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')
      expect(wrapper.find('.form-details').exists()).toBe(true)
    })

    it('should change toggle text when expanded', async () => {
      const wrapper = mount(ItemForm)
      const toggle = wrapper.find('.toggle-details')

      expect(toggle.text()).toContain('詳細を設定')
      await toggle.trigger('click')
      expect(toggle.text()).toContain('詳細を閉じる')
    })

    it('should render category buttons when expanded', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const categoryButtons = wrapper.findAll('.category-btn')
      expect(categoryButtons.length).toBe(6) // 6 categories
    })

    it('should render priority buttons when expanded', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const priorityButtons = wrapper.findAll('.priority-btn')
      expect(priorityButtons.length).toBe(3) // high, medium, low
    })
  })

  describe('form submission', () => {
    it('should emit submit event with form data', async () => {
      const wrapper = mount(ItemForm)

      await wrapper.find('.main-input').setValue('Milk')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toMatchObject({
        name: 'Milk',
        quantity: 1,
        stock: 0,
        memo: null,
        category: 'food',
        priority: 'medium',
        deadline: null
      })
    })

    it('should not emit submit when name is empty', async () => {
      const wrapper = mount(ItemForm)

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('should trim whitespace from name', async () => {
      const wrapper = mount(ItemForm)

      await wrapper.find('.main-input').setValue('  Bread  ')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0].name).toBe('Bread')
    })

    it('should not submit when name is only whitespace', async () => {
      const wrapper = mount(ItemForm)

      await wrapper.find('.main-input').setValue('   ')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('should reset form after submission', async () => {
      const wrapper = mount(ItemForm)

      const input = wrapper.find('.main-input')
      await input.setValue('Eggs')
      await wrapper.find('form').trigger('submit')

      expect(input.element.value).toBe('')
    })

    it('should include expanded form values when submitted', async () => {
      const wrapper = mount(ItemForm)

      // Expand form
      await wrapper.find('.toggle-details').trigger('click')

      // Fill in values
      await wrapper.find('.main-input').setValue('Cheese')

      // Change quantity using the number input
      const quantityInput = wrapper.findAll('.number-input input')[0]
      await quantityInput.setValue(3)

      // Submit
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0]).toMatchObject({
        name: 'Cheese',
        quantity: 3
      })
    })
  })

  describe('category selection', () => {
    it('should select category when button is clicked', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const categoryButtons = wrapper.findAll('.category-btn')
      await categoryButtons[1].trigger('click') // Click 'daily' category

      await wrapper.find('.main-input').setValue('Soap')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0].category).toBe('daily')
    })

    it('should highlight selected category', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const foodButton = wrapper.findAll('.category-btn')[0]
      expect(foodButton.classes()).toContain('active')
    })
  })

  describe('priority selection', () => {
    it('should select priority when button is clicked', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const priorityButtons = wrapper.findAll('.priority-btn')
      await priorityButtons[0].trigger('click') // Click 'high' priority

      await wrapper.find('.main-input').setValue('Urgent item')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0].priority).toBe('high')
    })
  })

  describe('quantity controls', () => {
    it('should increment quantity', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const incrementBtn = wrapper.findAll('.number-input button')[1]
      await incrementBtn.trigger('click')
      await incrementBtn.trigger('click')

      await wrapper.find('.main-input').setValue('Test')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0].quantity).toBe(3)
    })

    it('should not allow quantity below 1', async () => {
      const wrapper = mount(ItemForm)
      await wrapper.find('.toggle-details').trigger('click')

      const decrementBtn = wrapper.findAll('.number-input button')[0]
      await decrementBtn.trigger('click')
      await decrementBtn.trigger('click')

      await wrapper.find('.main-input').setValue('Test')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')[0][0].quantity).toBe(1)
    })
  })
})

describe('FilterBar', () => {
  const defaultModelValue = {
    search: '',
    category: 'all',
    priority: 'all',
    purchased: 'all',
    sort: 'created_at',
    order: 'desc'
  }

  describe('rendering', () => {
    it('should render search input', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })
      const searchInput = wrapper.find('.search-input')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toContain('検索')
    })

    it('should render category filter', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })
      const selects = wrapper.findAll('select')
      expect(selects.length).toBe(4) // category, priority, purchased, sort
    })

    it('should render sort order button', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })
      const orderBtn = wrapper.find('.order-btn')
      expect(orderBtn.exists()).toBe(true)
    })
  })

  describe('filter updates', () => {
    it('should emit update when category changes', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const categorySelect = wrapper.findAll('select')[0]
      await categorySelect.setValue('food')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].category).toBe('food')
    })

    it('should emit update when priority changes', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const prioritySelect = wrapper.findAll('select')[1]
      await prioritySelect.setValue('high')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].priority).toBe('high')
    })

    it('should emit update when purchased status changes', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const purchasedSelect = wrapper.findAll('select')[2]
      await purchasedSelect.setValue('true')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].purchased).toBe('true')
    })

    it('should emit update when sort changes', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const sortSelect = wrapper.findAll('select')[3]
      await sortSelect.setValue('name')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].sort).toBe('name')
    })

    it('should toggle sort order when button is clicked', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const orderBtn = wrapper.find('.order-btn')
      await orderBtn.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].order).toBe('asc')
    })

    it('should toggle order from asc to desc', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: { ...defaultModelValue, order: 'asc' } }
      })

      const orderBtn = wrapper.find('.order-btn')
      await orderBtn.trigger('click')

      expect(wrapper.emitted('update:modelValue')[0][0].order).toBe('desc')
    })
  })

  describe('search functionality', () => {
    it('should debounce search input', async () => {
      vi.useFakeTimers()

      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('milk')

      // Should not emit immediately
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()

      // Fast-forward past debounce time
      vi.advanceTimersByTime(350)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0].search).toBe('milk')

      vi.useRealTimers()
    })

    it('should show clear button when search has value', async () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      expect(wrapper.find('.clear-search').exists()).toBe(false)

      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('test')

      expect(wrapper.find('.clear-search').exists()).toBe(true)
    })

    it('should clear search when clear button is clicked', async () => {
      vi.useFakeTimers()

      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('test')

      const clearBtn = wrapper.find('.clear-search')
      await clearBtn.trigger('click')

      expect(searchInput.element.value).toBe('')

      vi.advanceTimersByTime(350)
      expect(wrapper.emitted('update:modelValue').pop()[0].search).toBe('')

      vi.useRealTimers()
    })
  })

  describe('sort display', () => {
    it('should display descending arrow when order is desc', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: { ...defaultModelValue, order: 'desc' } }
      })

      const orderBtn = wrapper.find('.order-btn')
      expect(orderBtn.text()).toBe('↓')
    })

    it('should display ascending arrow when order is asc', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: { ...defaultModelValue, order: 'asc' } }
      })

      const orderBtn = wrapper.find('.order-btn')
      expect(orderBtn.text()).toBe('↑')
    })
  })

  describe('filter options', () => {
    it('should have all category options', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const categorySelect = wrapper.findAll('select')[0]
      const options = categorySelect.findAll('option')

      expect(options.length).toBe(7) // 'all' + 6 categories
      expect(options[0].text()).toBe('すべて')
    })

    it('should have all priority options', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const prioritySelect = wrapper.findAll('select')[1]
      const options = prioritySelect.findAll('option')

      expect(options.length).toBe(4) // 'all' + 3 priorities
    })

    it('should have all purchased status options', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const purchasedSelect = wrapper.findAll('select')[2]
      const options = purchasedSelect.findAll('option')

      expect(options.length).toBe(3) // 'all', 'false', 'true'
    })

    it('should have all sort options', () => {
      const wrapper = mount(FilterBar, {
        props: { modelValue: defaultModelValue }
      })

      const sortSelect = wrapper.findAll('select')[3]
      const options = sortSelect.findAll('option')

      expect(options.length).toBe(5) // created_at, deadline, priority, name, stock
    })
  })
})

// ItemList Tests
import ItemList from '../src/components/ItemList.vue'

describe('ItemList', () => {
  const mockItems = [
    {
      id: 1,
      name: '牛乳',
      quantity: 2,
      stock: 0,
      memo: 'スーパーで購入',
      category: 'food',
      priority: 'high',
      deadline: null,
      purchased: false
    },
    {
      id: 2,
      name: '洗剤',
      quantity: 1,
      stock: 3,
      memo: null,
      category: 'daily',
      priority: 'medium',
      deadline: '2026-01-10',
      purchased: true
    }
  ]

  describe('rendering', () => {
    it('should render item cards for each item', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const cards = wrapper.findAll('.item-card')
      expect(cards.length).toBe(2)
    })

    it('should display item name', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const names = wrapper.findAll('.item-name')
      expect(names[0].text()).toBe('牛乳')
      expect(names[1].text()).toBe('洗剤')
    })

    it('should display quantity and stock', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const quantityMeta = wrapper.findAll('.meta-item.quantity')
      expect(quantityMeta[0].text()).toContain('購入: 2個')

      const stockMeta = wrapper.findAll('.meta-item.stock')
      expect(stockMeta[0].text()).toContain('在庫: 0個')
    })

    it('should display category badge', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const badges = wrapper.findAll('.category-badge')
      expect(badges[0].text()).toBe('🍎') // food category
      expect(badges[1].text()).toBe('🧴') // daily category
    })

    it('should display priority badge', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const badges = wrapper.findAll('.priority-badge')
      expect(badges[0].text()).toBe('高')
      expect(badges[1].text()).toBe('中')
    })

    it('should display memo when present', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const memoItems = wrapper.findAll('.meta-item.memo')
      expect(memoItems.length).toBe(1) // Only first item has memo
      expect(memoItems[0].text()).toContain('スーパーで購入')
    })

    it('should display deadline when present', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const deadlineItems = wrapper.findAll('.meta-item.deadline')
      expect(deadlineItems.length).toBe(1) // Only second item has deadline
    })

    it('should show empty state when no items', () => {
      const wrapper = mount(ItemList, {
        props: { items: [] }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-title').text()).toContain('商品が見つかりません')
    })
  })

  describe('item states', () => {
    it('should apply purchased class to purchased items', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const cards = wrapper.findAll('.item-card')
      expect(cards[0].classes()).not.toContain('purchased')
      expect(cards[1].classes()).toContain('purchased')
    })

    it('should apply low-stock class when stock is 1 or less and not purchased', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const cards = wrapper.findAll('.item-card')
      expect(cards[0].classes()).toContain('low-stock') // stock: 0, not purchased
      expect(cards[1].classes()).not.toContain('low-stock') // purchased, so no warning
    })

    it('should show warning style on low stock meta', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const stockMetas = wrapper.findAll('.meta-item.stock')
      expect(stockMetas[0].classes()).toContain('warning')
      expect(stockMetas[1].classes()).not.toContain('warning')
    })

    it('should show checkbox as checked for purchased items', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes[0].element.checked).toBe(false)
      expect(checkboxes[1].element.checked).toBe(true)
    })
  })

  describe('events', () => {
    it('should emit toggle-purchased when checkbox changes', async () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.trigger('change')

      expect(wrapper.emitted('toggle-purchased')).toBeTruthy()
      expect(wrapper.emitted('toggle-purchased')[0][0]).toMatchObject({ id: 1, name: '牛乳' })
    })

    it('should emit edit when item content is clicked', async () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const content = wrapper.find('.item-content')
      await content.trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0][0]).toMatchObject({ id: 1, name: '牛乳' })
    })

    it('should emit edit when edit button is clicked', async () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const editBtn = wrapper.find('.edit-btn')
      await editBtn.trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
    })

    it('should emit delete when delete button is clicked', async () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const deleteBtn = wrapper.find('.delete-btn')
      await deleteBtn.trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0][0]).toMatchObject({ id: 1 })
    })

    it('should emit update-stock when increment button is clicked', async () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const stockControls = wrapper.find('.stock-controls')
      const buttons = stockControls.findAll('button')
      await buttons[1].trigger('click') // Increment button

      expect(wrapper.emitted('update-stock')).toBeTruthy()
      expect(wrapper.emitted('update-stock')[0][0]).toMatchObject({ id: 1 })
      expect(wrapper.emitted('update-stock')[0][1]).toBe(1) // 0 + 1
    })

    it('should emit update-stock when decrement button is clicked', async () => {
      const wrapper = mount(ItemList, {
        props: { items: [{ ...mockItems[1], stock: 3 }] }
      })

      const stockControls = wrapper.find('.stock-controls')
      const buttons = stockControls.findAll('button')
      await buttons[0].trigger('click') // Decrement button

      expect(wrapper.emitted('update-stock')).toBeTruthy()
      expect(wrapper.emitted('update-stock')[0][1]).toBe(2) // 3 - 1
    })

    it('should disable decrement button when stock is 0', () => {
      const wrapper = mount(ItemList, {
        props: { items: mockItems }
      })

      const stockControls = wrapper.find('.stock-controls')
      const decrementBtn = stockControls.findAll('button')[0]
      expect(decrementBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('processing state', () => {
    it('should show processing overlay when item is processing', () => {
      const wrapper = mount(ItemList, {
        props: {
          items: mockItems,
          processingIds: new Set([1])
        }
      })

      const cards = wrapper.findAll('.item-card')
      expect(cards[0].classes()).toContain('processing')
      expect(cards[0].find('.processing-overlay').exists()).toBe(true)
      expect(cards[1].classes()).not.toContain('processing')
    })
  })
})

// EditModal Tests
import EditModal from '../src/components/EditModal.vue'

describe('EditModal', () => {
  const mockItem = {
    id: 1,
    name: '牛乳',
    quantity: 2,
    stock: 1,
    memo: 'メモ',
    category: 'food',
    priority: 'high',
    deadline: '2026-01-15'
  }

  describe('visibility', () => {
    it('should not render when show is false', () => {
      const wrapper = mount(EditModal, {
        props: { show: false, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
    })

    it('should render when show is true', () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
    })
  })

  describe('form population', () => {
    it('should populate form with item data', () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const nameInput = wrapper.find('input[type="text"]')
      expect(nameInput.element.value).toBe('牛乳')

      const activeCategory = wrapper.find('.category-btn.active')
      expect(activeCategory.text()).toContain('食品')

      const activePriority = wrapper.find('.priority-btn.active')
      expect(activePriority.text()).toBe('高')
    })

    it('should update form when item prop changes', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const newItem = { ...mockItem, name: '卵' }
      await wrapper.setProps({ item: newItem })

      const nameInput = wrapper.find('input[type="text"]')
      expect(nameInput.element.value).toBe('卵')
    })
  })

  describe('form interaction', () => {
    it('should change category when category button is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const categoryButtons = wrapper.findAll('.category-btn')
      await categoryButtons[1].trigger('click') // Click 'daily' category

      expect(categoryButtons[1].classes()).toContain('active')
    })

    it('should change priority when priority button is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const priorityButtons = wrapper.findAll('.priority-btn')
      await priorityButtons[2].trigger('click') // Click 'low' priority

      expect(priorityButtons[2].classes()).toContain('active')
    })

    it('should increment quantity when + button is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const numberInputs = wrapper.findAll('.number-input')
      const incrementBtn = numberInputs[0].findAll('button')[1]
      await incrementBtn.trigger('click')

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')[0][0].quantity).toBe(3)
    })

    it('should not allow quantity below 1', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: { ...mockItem, quantity: 1 } },
        global: {
          stubs: { Teleport: true }
        }
      })

      const numberInputs = wrapper.findAll('.number-input')
      const decrementBtn = numberInputs[0].findAll('button')[0]
      await decrementBtn.trigger('click')
      await decrementBtn.trigger('click')

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')[0][0].quantity).toBe(1)
    })
  })

  describe('form submission', () => {
    it('should emit save event with form data', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0]).toMatchObject({
        name: '牛乳',
        quantity: 2,
        stock: 1,
        category: 'food',
        priority: 'high'
      })
    })

    it('should not emit save when name is empty', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: { ...mockItem, name: '' } },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('should trim name before emitting', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      const nameInput = wrapper.find('input[type="text"]')
      await nameInput.setValue('  パン  ')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')[0][0].name).toBe('パン')
    })

    it('should convert empty memo to null', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: { ...mockItem, memo: '' } },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('save')[0][0].memo).toBeNull()
    })
  })

  describe('close behavior', () => {
    it('should emit close when close button is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('.close-btn').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close when cancel button is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('.cancel-btn').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close when backdrop is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('.modal-backdrop').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close when modal container is clicked', async () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem },
        global: {
          stubs: { Teleport: true }
        }
      })

      await wrapper.find('.modal-container').trigger('click')

      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('loading state', () => {
    it('should disable save button when loading', () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem, loading: true },
        global: {
          stubs: { Teleport: true }
        }
      })

      const saveBtn = wrapper.find('.save-btn')
      expect(saveBtn.attributes('disabled')).toBeDefined()
    })

    it('should disable cancel button when loading', () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem, loading: true },
        global: {
          stubs: { Teleport: true }
        }
      })

      const cancelBtn = wrapper.find('.cancel-btn')
      expect(cancelBtn.attributes('disabled')).toBeDefined()
    })

    it('should show spinner when loading', () => {
      const wrapper = mount(EditModal, {
        props: { show: true, item: mockItem, loading: true },
        global: {
          stubs: { Teleport: true }
        }
      })

      expect(wrapper.find('.save-btn .spinner').exists()).toBe(true)
    })
  })
})

// StatsPanel Tests
import StatsPanel from '../src/components/StatsPanel.vue'

describe('StatsPanel', () => {
  const mockStats = {
    total: 10,
    remaining: 6,
    purchased: 4,
    lowStock: 2,
    urgent: 1
  }

  describe('rendering', () => {
    it('should render all stat cards', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const cards = wrapper.findAll('.stat-card')
      expect(cards.length).toBe(5)
    })

    it('should display correct stat values', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const values = wrapper.findAll('.stat-value')
      expect(values[0].text()).toBe('10')
      expect(values[1].text()).toBe('6')
      expect(values[2].text()).toBe('4')
      expect(values[3].text()).toBe('2')
      expect(values[4].text()).toBe('1')
    })

    it('should display correct stat labels', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const labels = wrapper.findAll('.stat-label')
      expect(labels[0].text()).toBe('登録商品')
      expect(labels[1].text()).toBe('未購入')
      expect(labels[2].text()).toBe('購入済み')
      expect(labels[3].text()).toBe('在庫少')
      expect(labels[4].text()).toBe('期限間近')
    })

    it('should display correct stat icons', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const icons = wrapper.findAll('.stat-icon')
      expect(icons[0].text()).toBe('📋')
      expect(icons[1].text()).toBe('🛒')
      expect(icons[2].text()).toBe('✅')
      expect(icons[3].text()).toBe('⚠️')
      expect(icons[4].text()).toBe('🔥')
    })

    it('should not render when stats is null', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: null }
      })

      expect(wrapper.find('.stats-panel').exists()).toBe(false)
    })

    it('should handle empty stats object', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: {} }
      })

      const values = wrapper.findAll('.stat-value')
      expect(values[0].text()).toBe('0')
      expect(values[1].text()).toBe('0')
    })
  })

  describe('warning states', () => {
    it('should apply warning class when lowStock is greater than 0', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const lowStockCard = wrapper.find('.stat-card.low-stock')
      expect(lowStockCard.classes()).toContain('warning')
    })

    it('should apply warning class when urgent is greater than 0', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: mockStats }
      })

      const urgentCard = wrapper.find('.stat-card.urgent')
      expect(urgentCard.classes()).toContain('warning')
    })

    it('should not apply warning class when lowStock is 0', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: { ...mockStats, lowStock: 0 } }
      })

      const lowStockCard = wrapper.find('.stat-card.low-stock')
      expect(lowStockCard.classes()).not.toContain('warning')
    })

    it('should not apply warning class when urgent is 0', () => {
      const wrapper = mount(StatsPanel, {
        props: { stats: { ...mockStats, urgent: 0 } }
      })

      const urgentCard = wrapper.find('.stat-card.urgent')
      expect(urgentCard.classes()).not.toContain('warning')
    })
  })
})
