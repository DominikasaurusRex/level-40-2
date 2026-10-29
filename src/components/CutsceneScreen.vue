<script setup lang="ts">
import { ref } from 'vue'
import type { Cutscene } from '@/data/cutscenes'
import { playSound } from '@/audio/sounds'

const props = defineProps<{ scene: Cutscene }>()
const emit = defineEmits<{ close: [] }>()
const lineIndex = ref(0)

function advance() {
  playSound('normal-click')
  if (lineIndex.value < props.scene.lines.length - 1) lineIndex.value++
  else emit('close')
}
</script>

<template>
  <section class="cutscene" :style="{ backgroundImage: `url('${scene.background}')` }" aria-label="Story scene">
    <div class="scene-shade" aria-hidden="true" />
    <img class="portrait" :src="scene.portrait" :alt="scene.speaker" />
    <div class="dialogue" role="group" :aria-label="`${scene.speaker} dialogue`">
      <div class="speaker">{{ scene.speaker }}</div>
      <p class="line" aria-live="polite">{{ scene.lines[lineIndex] }}</p>
      <button class="advance" type="button" @click="advance">
        {{ lineIndex === scene.lines.length - 1 ? 'Finish' : 'Continue' }}
        <span aria-hidden="true">▸</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.cutscene {
  position: absolute;
  inset: 0;
  z-index: 300;
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
</style>
