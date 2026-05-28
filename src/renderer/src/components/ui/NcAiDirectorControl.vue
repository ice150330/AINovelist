<script setup lang="ts">
import { ref } from 'vue'
import NcButton from './NcButton.vue'
import NcSegmentedControl from './NcSegmentedControl.vue'
import NcInput from './NcInput.vue'
import IconSparkles from '../icons/icons/IconSparkles.vue'
import IconRefreshCw from '../icons/icons/IconRefreshCw.vue'

const emit = defineEmits<{
  generate: [prompt: string]
}>()

const prompt = ref('')
const style = ref('narrative')
const length = ref('medium')
const pov = ref('third')

const styleOptions = [
  { label: '叙事', value: 'narrative' },
  { label: '对话', value: 'dialogue' },
  { label: '描写', value: 'description' },
  { label: '转场', value: 'transition' }
]

const lengthOptions = [
  { label: '短篇', value: 'short' },
  { label: '中篇', value: 'medium' },
  { label: '长篇', value: 'long' }
]

const povOptions = [
  { label: '第三人称', value: 'third' },
  { label: '第一人称', value: 'first' }
]

function handleGenerate() {
  if (!prompt.value.trim()) return
  emit('generate', prompt.value)
}
</script>

<template>
  <div class="nc-ai-director-control">
    <div class="nc-ai-director-control__field">
      <label>生成指令</label>
      <NcInput
        v-model="prompt"
        multiline
        :rows="3"
        placeholder="输入生成指令，例如：续写主角在药王谷的对话，强调试探与防备的情绪"
      />
    </div>

    <div class="nc-ai-director-control__row">
      <div class="nc-ai-director-control__field">
        <label>风格</label>
        <NcSegmentedControl v-model="style" :options="styleOptions" />
      </div>
      <div class="nc-ai-director-control__field">
        <label>长度</label>
        <NcSegmentedControl v-model="length" :options="lengthOptions" />
      </div>
    </div>

    <div class="nc-ai-director-control__field">
      <label>视角</label>
      <NcSegmentedControl v-model="pov" :options="povOptions" />
    </div>

    <div class="nc-ai-director-control__actions">
      <NcButton variant="ghost" size="sm">
        <IconRefreshCw :size="14" /> 重置
      </NcButton>
      <NcButton variant="primary" @click="handleGenerate">
        <IconSparkles :size="16" /> 生成片段
      </NcButton>
    </div>
  </div>
</template>

<style scoped>
.nc-ai-director-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nc-ai-director-control__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.nc-ai-director-control__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nc-ai-director-control__field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink-muted);
}

.nc-ai-director-control__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .nc-ai-director-control__row {
    grid-template-columns: 1fr;
  }
}
</style>
