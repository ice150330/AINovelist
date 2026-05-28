<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import NcToast from './NcToast.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <TransitionGroup
    tag="div"
    name="toast"
    class="nc-toast-container"
  >
    <NcToast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
      @close="remove"
    />
  </TransitionGroup>
</template>

<style scoped>
.nc-toast-container {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.nc-toast-container > * {
  pointer-events: auto;
}
</style>
