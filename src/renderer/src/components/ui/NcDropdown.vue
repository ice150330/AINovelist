<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  placement?: 'bottom-left' | 'bottom-right' | 'bottom'
}

withDefaults(defineProps<Props>(), {
  placement: 'bottom-left'
})

const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

function toggle() {
  visible.value = !visible.value
  if (visible.value) {
    nextTick(() => {
      dropdownRef.value?.focus()
    })
  }
}

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    triggerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return
  }
  visible.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, true)
})

defineExpose({ open, close, toggle })
</script>

<template>
  <div class="nc-dropdown">
    <div
      ref="triggerRef"
      class="nc-dropdown__trigger"
      @click="toggle"
    >
      <slot name="trigger" />
    </div>
    <Transition name="dropdown">
      <div
        v-show="visible"
        ref="dropdownRef"
        tabindex="-1"
        class="nc-dropdown__menu"
        :class="`nc-dropdown__menu--${placement}`"
        @click="close"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nc-dropdown {
  position: relative;
  display: inline-block;
}

.nc-dropdown__trigger {
  cursor: pointer;
}

.nc-dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  z-index: 900;
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-paper);
  box-shadow: var(--shadow-floating);
  outline: none;
}

.nc-dropdown__menu--bottom-left {
  left: 0;
}

.nc-dropdown__menu--bottom-right {
  right: 0;
}

.nc-dropdown__menu--bottom {
  left: 50%;
  transform: translateX(-50%);
}

/* Transition */
.dropdown-enter-active {
  transition: all var(--duration-normal) var(--easing-decelerate);
}

.dropdown-leave-active {
  transition: all var(--duration-fast) var(--easing-accelerate);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
