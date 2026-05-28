import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcStatusPill from '../../../src/renderer/src/components/ui/NcStatusPill.vue'

describe('NcStatusPill', () => {
  it('renders slot content', () => {
    const wrapper = mount(NcStatusPill, {
      props: { status: 'success' },
      slots: { default: 'Done' }
    })
    expect(wrapper.text()).toBe('Done')
  })

  it('applies status styles', () => {
    const wrapper = mount(NcStatusPill, { props: { status: 'warning' } })
    const style = wrapper.find('.nc-status-pill').attributes('style')
    expect(style).toContain('background')
  })

  it.each(['success', 'warning', 'error', 'info', 'pending'] as const)(
    'renders with status %s',
    (status) => {
      const wrapper = mount(NcStatusPill, { props: { status } })
      expect(wrapper.find('.nc-status-pill').exists()).toBe(true)
    }
  )
})
