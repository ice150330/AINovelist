import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcEmptyState from '../../../src/renderer/src/components/ui/NcEmptyState.vue'

describe('NcEmptyState', () => {
  it('renders description', () => {
    const wrapper = mount(NcEmptyState, {
      props: { description: 'No data' }
    })
    expect(wrapper.text()).toContain('No data')
  })

  it('renders title when provided', () => {
    const wrapper = mount(NcEmptyState, {
      props: { title: 'Empty', description: 'No data' }
    })
    expect(wrapper.text()).toContain('Empty')
  })

  it('renders icon slot', () => {
    const wrapper = mount(NcEmptyState, {
      props: { description: 'No data' },
      slots: { icon: '<span class="custom-icon">Icon</span>' }
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('renders action slot', () => {
    const wrapper = mount(NcEmptyState, {
      props: { description: 'No data' },
      slots: { action: '<button>Action</button>' }
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
