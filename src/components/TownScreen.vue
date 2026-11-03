<script setup lang="ts">
import { ref } from 'vue'
import EmbarkConfirmation from './EmbarkConfirmation.vue'

const embarkOpen = ref(false)

const RADIUS_X_REM = 19
const RADIUS_Y_REM = 11

const buildings = [
  { id: 'inn', name: 'Inn', color: '#c9803c' },
  { id: 'barracks', name: 'Barracks', color: '#b8453f' },
  { id: 'smithy', name: 'Smithy', color: '#7d8590' },
  { id: 'library', name: 'Library', color: '#6a4fb0' },
  { id: 'quest-board', name: 'Quest Board', color: '#3f9a5a' },
  { id: 'bar', name: 'Bar', color: '#d4b13f' },
  { id: 'gate', name: 'Gate', color: '#3a8fb5' },
].map((building, index, all) => {
  const angle = (index / all.length) * 2 * Math.PI - Math.PI / 2
  return {
    ...building,
    style: {
      left: `calc(50% + ${Math.cos(angle) * RADIUS_X_REM}rem)`,
      top: `calc(50% + ${Math.sin(angle) * RADIUS_Y_REM}rem)`,
      background: building.color,
    },
  }
})
</script>

<template>
  <section class="town-screen" aria-labelledby="town-title">
    <h1 id="town-title" class="town-title">Town</h1>
    <button
      v-for="building in buildings"
      :key="building.id"
      type="button"
      class="building"
      :style="building.style"
      @click="building.id === 'gate' && (embarkOpen = true)"
    >
      {{ building.name }}
    </button>

    <Transition name="confirmation-fade">
      <EmbarkConfirmation
        v-if="embarkOpen"
        @cancel="embarkOpen = false"
        @embark="embarkOpen = false"
      />
    </Transition>
  </section>
</template>

<style scoped>
.town-screen {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #061d2c;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.town-title {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 0 3px 0 var(--ui-ink);
  transform: translate(-50%, -50%);
}

.building {
  position: absolute;
  width: 6.5rem;
  height: 4.5rem;
  padding: 0;
  border: 3px solid rgba(0, 0, 0, 0.55);
  border-radius: 0.4rem;
  color: #fff;
  cursor: pointer;
  font: 700 0.8rem/1.1 Arial, sans-serif;
  text-shadow: 0 1px 2px #000;
  transform: translate(-50%, -50%);
}

.building:hover {
  filter: brightness(1.15);
}

.confirmation-fade-enter-active {
  transition: opacity 180ms ease-out;
}

.confirmation-fade-leave-active {
  transition: opacity 140ms ease-in;
}

.confirmation-fade-enter-from,
.confirmation-fade-leave-to {
  opacity: 0;
}
</style>
