<script setup lang="ts">
import MenuButton from './MenuButton.vue'

const emit = defineEmits<{
  cancel: []
  embark: []
}>()
</script>

<template>
  <div class="embark-overlay">
    <div
      class="embark-confirmation"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="embark-confirmation-title"
    >
      <strong id="embark-confirmation-title">Ready to embark on your adventure?</strong>

      <div class="embark-actions">
        <MenuButton compact @click="emit('embark')">Embark</MenuButton>
        <MenuButton compact sound="close" @click="emit('cancel')">Cancel</MenuButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.embark-overlay {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  background: rgba(0, 13, 27, 0.66);
  backdrop-filter: blur(3px);
}

.embark-confirmation {
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

/* One column as wide as the widest button, so both buttons share that width. */
.embark-actions {
  display: grid;
  grid-template-columns: max-content;
  justify-content: center;
  gap: 0.65rem;
  padding: 0 0.75rem;
}
</style>
