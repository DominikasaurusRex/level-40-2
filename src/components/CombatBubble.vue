<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  side: 'enemy' | 'player'
  icon?: string
  value: string | number
}>()

const iconEl = ref<HTMLElement>()
defineExpose({ iconEl })
</script>

<template>
  <div class="combat-bubble" :class="`combat-bubble-${side}`">
    <span
      ref="iconEl"
      class="combat-bubble-icon"
      :style="{ backgroundImage: icon ? `url(${icon})` : undefined }"
    />
    <span class="combat-bubble-value">{{ value }}</span>
  </div>
</template>

<style scoped>
.combat-bubble {
  box-sizing: border-box;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  border: 2px solid var(--ui-ink);
  border-radius: 999px;
  background: var(--ui-active);
  color: var(--ui-ink);
  box-shadow: 0 0 0.45rem rgba(229, 236, 114, 0.22);
}

.combat-bubble-enemy {
  flex-direction: row-reverse;
}

.combat-bubble-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border-radius: 0.2rem;
  background-color: rgba(58, 119, 105, 0.7);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.combat-bubble-value {
  font-size: 0.7rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
