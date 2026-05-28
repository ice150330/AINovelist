<script setup lang="ts">
interface Props {
  icon?: string
  label: string
  active?: boolean
  disabled?: boolean
  badge?: string
  to?: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="nc-sidebar-nav-item"
    :class="{
      'nc-sidebar-nav-item--active': active,
      'nc-sidebar-nav-item--disabled': disabled
    }"
    @click="!to && emit('click', $event)"
  >
    <span v-if="active" class="nc-sidebar-nav-item__indicator" />
    <span v-if="icon" class="nc-sidebar-nav-item__icon">
      <slot name="icon">
        <span>{{ icon }}</span>
      </slot>
    </span>
    <span class="nc-sidebar-nav-item__label">{{ label }}</span>
    <span v-if="badge" class="nc-sidebar-nav-item__badge">{{ badge }}</span>
  </component>
</template>

<style scoped>
.nc-sidebar-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border: none;
  border-radius: var(--radius-medium);
  background: transparent;
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--duration-normal) var(--easing-standard),
    color var(--duration-normal) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard);
  outline: none;
}

.nc-sidebar-nav-item:hover:not(.nc-sidebar-nav-item--disabled) {
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: var(--shadow-raised);
  transform: translateY(-1px);
}

.nc-sidebar-nav-item:active:not(.nc-sidebar-nav-item--disabled) {
  background: var(--color-paper-strong);
  transform: translateY(0) scale(0.98);
}

.nc-sidebar-nav-item:focus-visible {
  box-shadow: 0 0 0 2px var(--color-accent);
}

.nc-sidebar-nav-item--active {
  background: rgba(168, 111, 42, 0.16);
  color: var(--color-accent);
}

.nc-sidebar-nav-item--active:hover {
  background: rgba(168, 111, 42, 0.22);
  box-shadow: var(--shadow-raised);
}

.nc-sidebar-nav-item--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.nc-sidebar-nav-item__indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  border-radius: 0 2px 2px 0;
  background: var(--color-accent);
  animation: indicator-slide-in var(--duration-normal) var(--easing-decelerate) both;
}

.nc-sidebar-nav-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nc-sidebar-nav-item__label {
  flex: 1;
  text-align: left;
}

.nc-sidebar-nav-item__badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(168, 111, 42, 0.13);
  color: var(--color-accent);
  font-size: 9px;
  font-weight: 700;
  flex-shrink: 0;
}
</style>