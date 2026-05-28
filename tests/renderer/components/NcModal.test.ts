import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcModal from '../../../src/renderer/src/components/ui/NcModal.vue'

describe('NcModal', () => {
  it('renders when visible is true', () => {
    const wrapper = mount(NcModal, {
      props: { visible: true, title: 'Test' },
      slots: { default: 'Content' }
    })
    expect(wrapper.find('.nc-modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Content')
  })

  it('does not render when visible is false', () => {
    const wrapper = mount(NcModal, {
      props: { visible: false, title: 'Test' }
    })
    expect(wrapper.find('.nc-modal').exists()).toBe(false)
  })

  it('emits close on overlay click', async () => {
    const wrapper = mount(NcModal, {
      props: { visible: true, title: 'Test' }
    })
    await wrapper.find('.nc-modal__overlay').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on close button click', async () => {
    const wrapper = mount(NcModal, {
      props: { visible: true, title: 'Test' }
    })
    await wrapper.find('.nc-modal__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not close on card click', async () => {
    const wrapper = mount(NcModal, {
      props: { visible: true, title: 'Test' },
      slots: { default: 'Content' }
    })
    await wrapper.find('.nc-modal__card').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
