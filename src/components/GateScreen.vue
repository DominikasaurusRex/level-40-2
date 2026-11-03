<script setup lang="ts">
import { computed, ref } from 'vue'
import { gateChatFor, gateScene } from '@/data/gate-chat'
import { playSound } from '@/audio/sounds'
import MenuButton from './MenuButton.vue'
import EmbarkConfirmation from './EmbarkConfirmation.vue'

const props = defineProps<{ furthestStage: number }>()
const emit = defineEmits<{ leave: [] }>()

const chat = computed(() => gateChatFor(props.furthestStage))
const chatting = ref(false)
const lineIndex = ref(0)
const embarkOpen = ref(false)
const isLastLine = computed(() => lineIndex.value >= chat.value.lines.length - 1)

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
  <section
    class="gate-screen"
    :style="{ backgroundImage: `url('${gateScene.background}')` }"
    aria-label="Gate"
  >
    <div class="scene-shade" aria-hidden="true" />
    <img class="portrait" :src="gateScene.portrait" :alt="gateScene.speaker" />

    <div v-if="chatting" class="dialogue" role="group" :aria-label="`${gateScene.speaker} dialogue`">
      <div class="speaker">{{ gateScene.speaker }}</div>
      <p class="line" aria-live="polite">{{ chat.lines[lineIndex] }}</p>
      <button class="advance" type="button" @click="advanceChat">
        {{ isLastLine ? 'Finish' : 'Continue' }}
        <span aria-hidden="true">▸</span>
      </button>
    </div>

    <div v-else class="gate-options">
      <MenuButton @click="startChat">Chat</MenuButton>
      <MenuButton @click="embarkOpen = true">Embark</MenuButton>
      <MenuButton sound="close" @click="emit('leave')">Back to Town</MenuButton>
    </div>

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
.gate-screen {
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
.gate-options {
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
