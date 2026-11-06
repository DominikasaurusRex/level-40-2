<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { FIRST_ENDING_STAGE, PlaceId, townPlaces } from '@/data/town'
import PlaceScreen from './PlaceScreen.vue'
import ResourceBar from './ResourceBar.vue'

const openPlaceId = ref<PlaceId>()
const game = useGameStore()
const fakeEndingFinished = computed(() => game.highestUnlockedLevel > FIRST_ENDING_STAGE)

const buildingPositions: Record<PlaceId, { left: string; top: string }> = {
  [PlaceId.Inn]: { left: '21%', top: '68%' },
  [PlaceId.Barracks]: { left: '48%', top: '34%' },
  [PlaceId.Smithy]: { left: '70%', top: '43%' },
  [PlaceId.Library]: { left: '89%', top: '45%' },
  [PlaceId.QuestBoard]: { left: '78%', top: '66%' },
  [PlaceId.Bar]: { left: '21%', top: '44%' },
  [PlaceId.Gate]: { left: '50%', top: '82%' },
}

const buildings = townPlaces.map(place => ({
  id: place.id,
  name: place.name,
  style: {
    ...buildingPositions[place.id],
    background: place.color,
  },
}))
</script>

<template>
  <section
    class="town-screen"
    :class="{ 'fake-ending-finished': fakeEndingFinished }"
    aria-label="Town"
  >
    <ResourceBar />
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

.town-screen.fake-ending-finished {
  background-image: url('/town/night.png');
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
