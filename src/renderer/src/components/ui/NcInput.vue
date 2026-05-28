<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="nc-input">
    <textarea
      v-if="multiline"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="nc-input__field nc-input__field--multiline"
      @input="onInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="nc-input__field"
      @input="onInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
  </div>
</template>

<style scoped>
.nc-input {
  width: 100%;
}

.nc-input__field {
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.86);
  box-shadow: inset 0 0 0 1px var(--color-border);
  color: var(--color-ink);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  transition:
    background var(--duration-normal) var(--easing-standard),
    box-shadow var(--duration-normal) var(--easing-standard);
  outline: none;
}

.nc-input__field::placeholder {
  color: var(--color-ink-faint);
}

.nc-input__field:hover:not(:disabled) {
  box-shadow: inset 0 0 0 1px rgba(168, 111, 42, 0.28);
}

.nc-input__field:focus {
  background: var(--color-paper);
  box-shadow:
    inset 0 0 0 1px rgba(168, 111, 42, 0.58),
    0 0 0 4px rgba(168, 111, 42, 0.12);
}

.nc-input__field:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.nc-input__field--multiline {
  resize: vertical;
  min-height: 80px;
}
</style>
