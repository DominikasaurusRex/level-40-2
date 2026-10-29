<script setup lang="ts">
import MenuButton from './MenuButton.vue'

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <div class="new-game-overlay">
    <div
      class="new-game-confirmation"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="new-game-confirmation-title"
      aria-describedby="new-game-confirmation-description"
    >
      <strong id="new-game-confirmation-title">Start a new game?</strong>
      <span id="new-game-confirmation-description">Your existing progress will be reset.</span>

      <div class="new-game-actions">
        <MenuButton compact danger @click="emit('confirm')">New Game</MenuButton>
      </div>
      <div class="new-game-actions">
        <MenuButton compact sound="close" @click="emit('cancel')">Cancel</MenuButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.new-game-overlay {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  background: rgba(0, 13, 27, 0.66);
  backdrop-filter: blur(3px);
}

.new-game-confirmation {
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

.new-game-confirmation span {
  color: var(--ui-muted);
  font: 0.8rem/1.4 Arial, sans-serif;
  text-shadow: none;
}

.new-game-actions {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 0 0.75rem;
}
</style>
