<script setup lang="ts">
import { ref } from 'vue'
import { townPlaces, type PlaceId } from '@/data/town'
import PlaceScreen from './PlaceScreen.vue'
import ResourceBar from './ResourceBar.vue'

const openPlaceId = ref<PlaceId>()

const RADIUS_X_REM = 19
const RADIUS_Y_REM = 11

const buildings = townPlaces.map((place, index, all) => {
  const angle = (index / all.length) * 2 * Math.PI - Math.PI / 2
  return {
    id: place.id,
    name: place.name,
    style: {
      left: `calc(50% + ${Math.cos(angle) * RADIUS_X_REM}rem)`,
      top: `calc(50% + ${Math.sin(angle) * RADIUS_Y_REM}rem)`,
      background: place.color,
    },
  }
})
</script>

<template>
  <section class="town-screen" aria-labelledby="town-title">
    <ResourceBar />
    <h1 id="town-title" class="town-title">Town</h1>
    <button
      v-for="building in buildings"
      :key="building.id"
      type="button"
      class="building"
      :style="building.style"
      @click="openPlaceId = building.id"
    >
      {{ building.name }}
    </button>

    <Transition name="confirmation-fade">
      <PlaceScreen
        v-if="openPlaceId"
        :key="openPlaceId"
        :place-id="openPlaceId"
        @leave="openPlaceId = undefined"
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
  background: #061d2c url('/town/day.png') center / cover no-repeat;
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
