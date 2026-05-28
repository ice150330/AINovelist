import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcInput from '../../../src/renderer/src/components/ui/NcInput.vue'

describe('NcInput', () => {
  it('renders input element', () => {
    const wrapper = mount(NcInput)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders textarea when multiline', () => {
    const wrapper = mount(NcInput, { props: { multiline: true } })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('displays placeholder', () => {
    const wrapper = mount(NcInput, { props: { placeholder: 'Enter text' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(NcInput)
    const input = wrapper.find('input')
    await input.setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['hello'])
  })

  it('emits focus event', async () => {
    const wrapper = mount(NcInput)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('respects disabled prop', () => {
    const wrapper = mount(NcInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
