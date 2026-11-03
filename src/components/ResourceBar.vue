<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { resources } from '@/data/resources'

const game = useGameStore()
const numberFormat = new Intl.NumberFormat('en-US')
</script>

<template>
  <div class="resource-bar" role="group" aria-label="Resources">
    <div
      v-for="resource in resources"
      :key="resource.id"
      class="resource"
      :title="resource.name"
    >
      <span class="value">{{ numberFormat.format(game.resources[resource.id]) }}</span>
      <img class="icon" :src="resource.icon" :alt="resource.name" />
    </div>
  </div>
</template>

<style scoped>
.resource-bar {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  left: 0.75rem;
  z-index: 50;
  display: flex;
  gap: 0.75rem;
  box-sizing: border-box;
  padding: 0.3rem 0.9rem;
  border: 2px solid var(--ui-border);
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, rgba(15, 111, 124, 0.88), rgba(4, 55, 77, 0.9));
  box-shadow: 0 0.25rem 0.6rem rgba(0, 0, 0, 0.5);
  color: var(--ui-text);
  font: 700 0.85rem/1 Arial, sans-serif;
  text-shadow: 0 1px 2px var(--ui-ink);
}

/* Every resource gets the same share of the bar. */
.resource {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon {
  flex: none;
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}
</style>
