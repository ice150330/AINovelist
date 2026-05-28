import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NcSegmentedControl from '../../../src/renderer/src/components/ui/NcSegmentedControl.vue'

describe('NcSegmentedControl', () => {
  const options = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' }
  ]

  it('renders all options', () => {
    const wrapper = mount(NcSegmentedControl, {
      props: { options, modelValue: 'a' }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('A')
    expect(buttons[1].text()).toBe('B')
  })

  it('marks active option', () => {
    const wrapper = mount(NcSegmentedControl, {
      props: { options, modelValue: 'b' }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes()).not.toContain('nc-segmented-control__item--active')
    expect(buttons[1].classes()).toContain('nc-segmented-control__item--active')
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(NcSegmentedControl, {
      props: { options, modelValue: 'a' }
    })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['b'])
  })

  it('does not emit when clicking active option', async () => {
    const wrapper = mount(NcSegmentedControl, {
      props: { options, modelValue: 'a' }
    })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
