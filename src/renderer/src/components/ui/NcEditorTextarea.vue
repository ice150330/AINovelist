<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  minHeight?: number
}

withDefaults(defineProps<Props>(), {
  rows: 12,
  minHeight: 200
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="nc-editor-textarea">
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="nc-editor-textarea__field"
      :style="{ minHeight: `${minHeight}px` }"
      @input="onInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<style scoped>
.nc-editor-textarea {
  width: 100%;
}

.nc-editor-textarea__field {
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.86);
  box-shadow: inset 0 0 0 1px var(--color-border);
  color: var(--color-ink);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.75;
  resize: vertical;
  transition:
    background var(--duration-normal) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard);
  outline: none;
}

.nc-editor-textarea__field::placeholder {
  color: var(--color-ink-faint);
}

.nc-editor-textarea__field:hover:not(:disabled) {
  box-shadow: inset 0 0 0 1px rgba(168, 111, 42, 0.28);
}

.nc-editor-textarea__field:focus {
  background: var(--color-paper);
  box-shadow:
    inset 0 0 0 1px rgba(168, 111, 42, 0.58),
    0 0 0 4px rgba(168, 111, 42, 0.12);
}

.nc-editor-textarea__field:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
