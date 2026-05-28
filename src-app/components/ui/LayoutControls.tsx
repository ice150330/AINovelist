import React from 'react'
import { densityOptions, scaleOptions, type UiDensity, type UiScale } from '../../uiPreferences'

interface LayoutControlsProps {
  density: UiDensity
  scale: UiScale
  onDensityChange: (density: UiDensity) => void
  onScaleChange: (scale: UiScale) => void
}

export function LayoutControls({ density, scale, onDensityChange, onScaleChange }: LayoutControlsProps) {
  return (
    <div className="layout-controls" aria-label="界面显示设置">
      <div className="control-segment" aria-label="整体缩放">
        {scaleOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            className={scale === option.value ? 'active' : ''}
            aria-pressed={scale === option.value}
            title={option.description}
            onClick={() => onScaleChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="control-segment density-segment" aria-label="界面密度">
        {densityOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            className={density === option.value ? 'active' : ''}
            aria-pressed={density === option.value}
            title={option.description}
            onClick={() => onDensityChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
