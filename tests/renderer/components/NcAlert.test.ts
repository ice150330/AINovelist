import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcAlert from '../../../src/renderer/src/components/ui/NcAlert.vue'

describe('NcAlert', () => {
  it('renders slot content', () => {
    const wrapper = mount(NcAlert, {
      props: { type: 'info' },
      slots: { default: 'Alert message' }
    })
    expect(wrapper.text()).toContain('Alert message')
  })

  it('applies type styles', () => {
    const wrapper = mount(NcAlert, { props: { type: 'success' } })
    const style = wrapper.find('.nc-alert').attributes('style')
    expect(style).toContain('background')
  })

  it('shows close button when closable', () => {
    const wrapper = mount(NcAlert, { props: { type: 'info', closable: true } })
    expect(wrapper.find('.nc-alert__close').exists()).toBe(true)
  })

  it('hides close button when not closable', () => {
    const wrapper = mount(NcAlert, { props: { type: 'info', closable: false } })
    expect(wrapper.find('.nc-alert__close').exists()).toBe(false)
  })

  it('emits close event', async () => {
    const wrapper = mount(NcAlert, { props: { type: 'info', closable: true } })
    await wrapper.find('.nc-alert__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
