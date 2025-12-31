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
