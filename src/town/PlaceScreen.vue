<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { backgroundFor, placeById, PlaceId } from '@/town/town'
import { chatFor } from '@/town/chats'
import { playSound } from '@/audio/sounds'
import MenuButton from '@/ui/MenuButton.vue'
import EmbarkConfirmation from './EmbarkConfirmation.vue'
import ResourceBar from '@/resources/ResourceBar.vue'
import BookModal from '@/ui/BookModal.vue'

/** Places whose action opens its own screen instead of the book (embark, skill board). */
const placesWithoutBook: PlaceId[] = [PlaceId.Gate, PlaceId.Barracks]

const props = defineProps<{ placeId: PlaceId }>()
const emit = defineEmits<{ leave: []; embark: [] }>()

const game = useGameStore()
const place = computed(() => placeById(props.placeId))
const rebuilt = computed(() => game.rebuiltPlaceIds.includes(props.placeId))
const chat = computed(() => chatFor(props.placeId, {
  furthestStage: game.highestUnlockedLevel,
  rebuilt: rebuilt.value,
  fullyUpgraded: false,
  originalSaveImported: game.originalSaveImported,
  originalFinalBossBeaten: game.originalFinalBossBeaten,
}))
const actionOpen = ref(false)

const chatting = ref(false)
const lineIndex = ref(0)
const isLastLine = computed(() => lineIndex.value >= chat.value.lines.length - 1)

const sceneStyle = computed(() => {
  const image = backgroundFor(place.value, {
    furthestStage: game.highestUnlockedLevel,
    rebuilt: rebuilt.value,
  })
  return image
    ? { backgroundImage: `url('${image}')` }
    : { background: `linear-gradient(160deg, ${place.value.color}, #120f0d 85%)` }
})

function startChat() {
  lineIndex.value = 0
  chatting.value = true
}

function advanceChat() {
  playSound('normal-click')
  if (isLastLine.value) chatting.value = false
  else lineIndex.value++
}
</script>

<template>
  <section class="place-screen" :style="sceneStyle" :aria-label="place.name">
    <div class="scene-shade" aria-hidden="true" />
    <ResourceBar />
    <h1 class="place-name">{{ place.name }}</h1>
    <img v-if="place.npc.portrait" class="portrait" :src="place.npc.portrait" :alt="place.npc.name" />

    <div v-if="chatting" class="dialogue" role="group" :aria-label="`${place.npc.name} dialogue`">
      <div class="speaker">{{ place.npc.name }}</div>
      <p class="line" aria-live="polite">{{ chat.lines[lineIndex] }}</p>
      <button class="advance" type="button" @click="advanceChat">
        {{ isLastLine ? 'Finish' : 'Continue' }}
        <span aria-hidden="true">▸</span>
      </button>
    </div>

    <div v-else class="place-options">
      <MenuButton @click="startChat">Chat</MenuButton>
      <MenuButton
        :disabled="!rebuilt"
        :title="rebuilt ? undefined : 'Needs rebuilding'"
        @click="actionOpen = true"
      >
        {{ place.actionLabel }}
      </MenuButton>
      <MenuButton sound="close" @click="emit('leave')">Back to Town</MenuButton>
    </div>

    <Transition name="confirmation-fade">
      <EmbarkConfirmation
        v-if="actionOpen && placeId === PlaceId.Gate"
        @cancel="actionOpen = false"
        @embark="emit('embark')"
      />
    </Transition>

    <Transition name="confirmation-fade">
      <BookModal
        v-if="actionOpen && !placesWithoutBook.includes(placeId)"
        :title="place.actionLabel"
        @close="actionOpen = false"
      />
    </Transition>
  </section>
</template>

<style scoped>
.place-screen {
  position: absolute;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  background-color: #221d1a;
  background-position: center;
  background-size: cover;
  color: #fff5dc;
  font-family: Georgia, 'Times New Roman', serif;
}

.scene-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 11, 11, 0.1) 12%, rgba(12, 11, 11, 0.35) 55%, rgba(12, 11, 11, 0.9) 100%);
}

.place-name {
  position: absolute;
  top: 3rem;
  left: 1.25rem;
  margin: 0;
  font-size: 1.6rem;
  text-shadow: 0 2px 0 #000, 0 0 0.5rem rgba(0, 0, 0, 0.7);
}

.portrait {
  position: absolute;
  bottom: 5.8rem;
  left: 3rem;
  max-width: 40%;
  max-height: 75%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 0.3rem 0.7rem rgba(0, 0, 0, 0.65));
}

/* One column as wide as the widest button, so all buttons share that width. */
.place-options {
  position: absolute;
  top: 50%;
  right: 5rem;
  display: grid;
  grid-template-columns: max-content;
  gap: 1rem;
  transform: translateY(-50%);
}

.dialogue {
  position: absolute;
  right: 1.25rem;
  bottom: 1.15rem;
  left: 1.25rem;
  min-height: 5.5rem;
  box-sizing: border-box;
  padding: 0.9rem 1.15rem 0.75rem;
  border: 2px solid #c4a370;
  background: rgba(19, 21, 24, 0.92);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 245, 220, 0.18);
}

.speaker {
  position: absolute;
  top: -1.25rem;
  left: 0.75rem;
  padding: 0.28rem 0.8rem;
  border: 2px solid #c4a370;
  background: #29231e;
  color: #f8dca2;
  font-size: 0.85rem;
  font-weight: bold;
}

.line {
  min-height: 2.6rem;
  margin: 0 0 0.3rem;
  font-size: 1rem;
  line-height: 1.35;
}

.advance {
  display: block;
  margin-left: auto;
  padding: 0.25rem 0.45rem;
  border: 0;
  background: transparent;
  color: #f8dca2;
  font: bold 0.7rem Arial, sans-serif;
  letter-spacing: 0.08em;
  cursor: pointer;
  text-transform: uppercase;
}

.advance:hover,
.advance:focus-visible { color: #fff; outline: 1px solid #f8dca2; }
.advance span { margin-left: 0.5rem; }

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
