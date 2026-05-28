import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NcButton from '../../../src/renderer/src/components/ui/NcButton.vue'

describe('NcButton', () => {
  it('renders default slot content', () => {
    const wrapper = mount(NcButton, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(NcButton)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(NcButton, { props: { disabled: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(NcButton, { props: { loading: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies variant class', () => {
    const wrapper = mount(NcButton, { props: { variant: 'secondary' } })
    expect(wrapper.find('button').classes()).toContain('nc-button--secondary')
  })

  it('applies size class', () => {
    const wrapper = mount(NcButton, { props: { size: 'sm' } })
    expect(wrapper.find('button').classes()).toContain('nc-button--sm')
  })

  it('shows spinner when loading', () => {
    const wrapper = mount(NcButton, { props: { loading: true } })
    expect(wrapper.find('.nc-button__spinner').exists()).toBe(true)
  })
})
