<script setup lang="ts">
import { ref } from 'vue'
import MenuButton from '@/ui/MenuButton.vue'
import { parseOriginalSave } from '@/stores/save'
import type { OriginalSaveInfo } from '@/stores/game'

const emit = defineEmits<{
  importOriginalSave: [originalSave: OriginalSaveInfo]
  startFresh: []
}>()

const fileInput = ref<HTMLInputElement>()
const importError = ref<string>()

async function importSelectedFile() {
  const file = fileInput.value?.files?.[0]
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return

  const originalSave = parseOriginalSave(await file.text())
  if (!originalSave) {
    importError.value = 'That is not a valid Level 40 save file.'
    return
  }

  emit('importOriginalSave', originalSave)
}
</script>

<template>
  <div class="starting-gift-overlay">
    <div
      class="starting-gift-prompt"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="starting-gift-title"
      aria-describedby="starting-gift-description"
    >
      <strong id="starting-gift-title">New Game</strong>
      <span id="starting-gift-description">
        Played the original Level 40? Import your save to receive a small starting gift.
        You can also claim it later in the game.
      </span>

      <div class="starting-gift-actions">
        <MenuButton compact @click="fileInput?.click()">Import Level 40 Save</MenuButton>
        <MenuButton compact @click="emit('startFresh')">Start Fresh</MenuButton>
        <input ref="fileInput" class="starting-gift-file" type="file" accept=".sav" @change="importSelectedFile" />
      </div>
      <span v-if="importError" class="starting-gift-error" role="alert">{{ importError }}</span>
    </div>
  </div>
</template>

<style scoped>
.starting-gift-overlay {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  background: rgba(0, 13, 27, 0.66);
  backdrop-filter: blur(3px);
}

.starting-gift-prompt {
  display: flex;
  width: 16rem;
  box-sizing: border-box;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1.25rem;
  border: 3px solid var(--ui-border);
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, rgba(15, 111, 124, 0.9), rgba(4, 55, 77, 0.92));
  box-shadow: 0 0.5rem 1.5rem #000;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
  text-align: center;
  text-shadow: 0 2px 0 var(--ui-ink);
}

.starting-gift-prompt span {
  color: var(--ui-muted);
  font: 0.8rem/1.4 Arial, sans-serif;
  text-shadow: none;
}

.starting-gift-prompt .starting-gift-error {
  color: var(--ui-enemy-hp);
}

.starting-gift-file {
  display: none;
}

/* One column as wide as the widest button, so both buttons share that width. */
.starting-gift-actions {
  display: grid;
  grid-template-columns: max-content;
  justify-content: center;
  gap: 0.65rem;
  padding: 0 0.75rem;
}
</style>
