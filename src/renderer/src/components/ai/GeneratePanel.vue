<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { GenerateTextResult, WritingRequest } from '@shared/schemas/ai.schema'
import NcInput from '../ui/NcInput.vue'
import NcButton from '../ui/NcButton.vue'
import NcSelect from '../ui/NcSelect.vue'
import NcEmptyState from '../ui/NcEmptyState.vue'
import NcAiResultNote from '../ui/NcAiResultNote.vue'

const loading = ref(false)
const result = ref<GenerateTextResult | null>(null)

const form = reactive<WritingRequest>({
  intent: 'continue',
  sceneType: 'dialogue',
  mood: 'tense',
  pacing: 'normal',
  requiredCharacterIds: [],
  bannedCharacterIds: [],
  targetWords: 800,
  userNote: '',
  knowledgeEntryIds: []
})

const intentOptions = [
  { label: '续写', value: 'continue' },
  { label: '改写', value: 'rewrite' },
  { label: '扩写', value: 'expand' },
  { label: '分支大纲', value: 'outline_branch' },
  { label: '场景脚本', value: 'scene_script' }
]

const sceneTypeOptions = [
  { label: '对话', value: 'dialogue' },
  { label: '动作', value: 'action' },
  { label: '描写', value: 'description' },
  { label: '转场', value: 'transition' },
  { label: '独白', value: 'monologue' }
]

async function generate(): Promise<void> {
  loading.value = true
  try {
    result.value = await window.novelcraft.ai.generate(form)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="generate-panel">
    <div class="panel-intro">
      <strong>AI 助手</strong>
      <span>先用 Mock Provider 打通结构化生成流程。</span>
    </div>

    <div class="generate-form">
      <div class="form-grid">
        <div class="form-field">
          <label>写作意图</label>
          <NcSelect v-model="form.intent" :options="intentOptions" />
        </div>
        <div class="form-field">
          <label>场景类型</label>
          <NcSelect v-model="form.sceneType" :options="sceneTypeOptions" />
        </div>
      </div>

      <div class="form-field">
        <label>补充说明</label>
        <NcInput v-model="form.userNote" multiline :rows="4" placeholder="写下本次生成要强调的情绪、冲突或限制" />
      </div>
      <NcButton variant="primary" :loading="loading" @click="generate">生成试写片段</NcButton>
    </div>

    <div class="result-block">
      <NcAiResultNote
        v-if="result"
        :text="result.text"
        :intent="intentOptions.find(o => o.value === form.intent)?.label"
        :scene-type="sceneTypeOptions.find(o => o.value === form.sceneType)?.label"
        @apply="$emit('apply', result.text)"
        @discard="result = null"
      />
      <NcEmptyState v-else description="生成结果会像批注纸条一样出现在这里" />
    </div>
  </section>
</template>

<style scoped>
.generate-panel {
  display: grid;
  gap: 16px;
}

.panel-intro {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: rgba(251, 239, 210, 0.58);
}

.panel-intro strong {
  color: var(--color-ink);
}

.panel-intro span {
  color: var(--color-ink-muted);
  font-size: 12px;
  line-height: 1.6;
}

.generate-form {
  display: grid;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  color: var(--color-ink-muted);
  font-size: 12px;
  font-weight: 600;
}

.result-block {
  min-height: 180px;
}

.generate-result {
  margin: 0;
  padding: 14px;
  border: 1px solid rgba(168, 111, 42, 0.22);
  border-radius: var(--radius-panel);
  background: linear-gradient(180deg, rgba(255, 248, 232, 0.96), rgba(251, 239, 210, 0.86));
  color: var(--color-ink);
  white-space: pre-wrap;
  line-height: 1.75;
  box-shadow: var(--shadow-soft);
}

@media (max-width: 1280px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
