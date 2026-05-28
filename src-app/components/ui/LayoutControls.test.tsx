import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LayoutControls } from './LayoutControls'

afterEach(cleanup)

describe('LayoutControls', () => {
  it('emits scale and density changes', () => {
    const onScaleChange = vi.fn()
    const onDensityChange = vi.fn()

    render(
      <LayoutControls
        density="comfortable"
        scale="medium"
        onDensityChange={onDensityChange}
        onScaleChange={onScaleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '110%' }))
    fireEvent.click(screen.getByRole('button', { name: '紧凑' }))

    expect(onScaleChange).toHaveBeenCalledWith('large')
    expect(onDensityChange).toHaveBeenCalledWith('compact')
  })

  it('marks the active choices for assistive tech', () => {
    render(
      <LayoutControls
        density="spacious"
        scale="small"
        onDensityChange={() => undefined}
        onScaleChange={() => undefined}
      />
    )

    expect(screen.getByRole('button', { name: '90%' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: '宽松' }).getAttribute('aria-pressed')).toBe('true')
  })
})
