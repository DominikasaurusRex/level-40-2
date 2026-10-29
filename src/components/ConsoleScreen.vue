<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { playSound, setSoundVolume, soundVolume } from '@/audio/sounds'

const emit = defineEmits<{
  openMenu: []
}>()

const homeUrl = 'http://dominikasaurus.com'
const volume = soundVolume
const showVolumeDisplay = ref(false)
let volumeDisplayTimeout: ReturnType<typeof setTimeout> | undefined

function adjustVolume(change: number) {
  setSoundVolume(volume.value + change)
  playSound('hardware-click')
  showVolumeDisplay.value = true

  clearTimeout(volumeDisplayTimeout)
  volumeDisplayTimeout = setTimeout(() => {
    showVolumeDisplay.value = false
  }, 1600)
}

function openMenu() {
  playSound('hardware-click')
  emit('openMenu')
}

onBeforeUnmount(() => clearTimeout(volumeDisplayTimeout))
</script>

<template>
  <section class="console-screen">
    <div class="console-screen-glass">
      <slot />
      <Transition name="volume-display">
        <div v-if="showVolumeDisplay" class="volume-display" role="status" aria-live="polite">
          <img
            class="volume-display-icon"
            :src="volume === 0 ? '/icons/system/mute.svg' : '/icons/system/sound.svg'"
            :alt="volume === 0 ? 'Muted' : 'Volume'"
          />
          <div class="volume-display-track" aria-hidden="true">
            <span
              v-for="step in 10"
              :key="step"
              class="volume-display-step"
              :class="{ active: step <= volume / 10 }"
            >
              <i v-for="mark in 3" :key="mark" class="volume-display-mark" />
            </span>
          </div>
          <div class="volume-display-value">{{ volume }}</div>
        </div>
      </Transition>
    </div>
    <nav class="console-menu" aria-label="Console controls">
      <div class="console-menu-group console-menu-left">
        <a
          class="console-menu-button console-home"
          :href="homeUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="playSound('hardware-click')"
        >HOME</a>
        <div class="console-volume-group">
          <button class="console-menu-button console-volume" type="button" aria-label="Volume down" @click="adjustVolume(-10)">−</button>
          <span class="console-volume-label">VOL</span>
          <button class="console-menu-button console-volume" type="button" aria-label="Volume up" @click="adjustVolume(10)">+</button>
        </div>
      </div>
      <img class="console-mark" src="/DSR-logo.svg" alt="DSR" />
      <div class="console-menu-group console-menu-right">
        <button class="console-menu-button console-option" type="button" @click="openMenu">SELECT</button>
        <button class="console-menu-button console-option" type="button" @click="openMenu">START</button>
      </div>
    </nav>
  </section>
</template>

<style scoped>
.console-screen {
  position: relative;
  width: max-content;
  overflow: hidden;
  padding: 1.5rem;
  border: 4px solid #17171d;
  border-radius: 2rem 2rem 3rem 3rem / 1.75rem 1.75rem 2rem 2rem;
  background:
    linear-gradient(180deg, rgba(119, 142, 158, 0.16), transparent 18%),
    linear-gradient(145deg, #1d252c, #090d12 66%, #030507);
  box-shadow:
    inset 0 3px 2px rgba(225, 238, 247, 0.3),
    inset 2px 0 2px rgba(173, 194, 210, 0.1),
    inset -2px -4px 5px rgba(0, 0, 0, 0.72),
    0 5px 8px rgba(0, 0, 0, 0.58);
}

.console-screen::before {
  content: '';
  position: absolute;
  top: 0.48rem;
  right: 4.5rem;
  left: 4.5rem;
  height: 0.22rem;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, rgba(229, 241, 249, 0.46) 28%, rgba(255, 255, 255, 0.2) 72%, transparent);
  filter: blur(0.04rem);
  pointer-events: none;
}

.console-screen::after {
  content: '';
  position: absolute;
  z-index: 5;
  top: -35%;
  bottom: -35%;
  left: 13%;
  width: 24%;
  background: linear-gradient(90deg, transparent, rgba(220, 237, 248, 0.13) 38%, rgba(255, 255, 255, 0.2) 50%, rgba(203, 224, 238, 0.08) 66%, transparent);
  filter: blur(0.18rem);
  transform: rotate(17deg);
  transform-origin: center;
  pointer-events: none;
}

.console-screen-glass {
  position: relative;
  padding: 0.4rem;
  border: 3px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(#07090c, #07090c) padding-box,
    linear-gradient(145deg, #75818a  0%, #20252a 24%, #030405 68%, #444c53 100%) border-box;
  box-shadow:
    inset 0 0 1.25rem rgba(0, 0, 0, 0.94),
    inset 0 2px 2px rgba(199, 217, 230, 0.16),
    0 1px rgba(255, 255, 255, 0.14),
    0 3px 5px rgba(0, 0, 0, 0.62);
}

.volume-display {
  position: absolute;
  right: 2.2rem;
  bottom: 2.2rem;
  left: 2.2rem;
  z-index: 20;
  display: grid;
  grid-template-columns: auto 1fr 2.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border: 3px solid #eee;
  background: rgba(4, 7, 10, 0.86);
  box-shadow: 0 0 0 3px #111, 0 4px 0 rgba(0, 0, 0, 0.55);
  color: #fff;
  font-family: "Courier New", monospace;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.volume-display-track {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.32rem;
  height: 1rem;
}

.volume-display-icon {
  display: block;
  width: 1.6rem;
  height: 1.6rem;
  filter: brightness(0) invert(1);
  object-fit: contain;
}

.volume-display-step {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  gap: 0.1rem;
}

.volume-display-mark {
  display: block;
  width: 0.18rem;
  height: 0.18rem;
  border-radius: 50%;
  background: #f4f4f4;
  justify-self: center;
}

.volume-display-step.active .volume-display-mark {
  width: 3px;
  height: 1rem;
  border-radius: 0;
}

.volume-display-value {
  text-align: right;
}

.volume-display-enter-active,
.volume-display-leave-active {
  transition: opacity 90ms steps(2, end);
}

.volume-display-enter-from,
.volume-display-leave-to {
  opacity: 0;
}

.console-menu {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  min-height: 1.9rem;
  margin-top: 0.55rem;
  padding: 0 1.25rem;
}

.console-menu-group,
.console-volume-group {
  display: flex;
  align-items: center;
}

.console-menu-left {
  justify-content: flex-start;
  gap: 1.2rem;
}

.console-volume-group {
  gap: 0.4rem;
}

.console-menu-right {
  justify-content: flex-end;
  gap: 0.75rem;
}

.console-menu-button {
  box-sizing: border-box;
  min-width: 1.85rem;
  height: 1.35rem;
  padding: 0 0.45rem;
  border: 1px solid #08080b;
  border-radius: 0.32rem;
  background: linear-gradient(165deg, #65656d 0%, #3b3b42 42%, #202026 100%);
  box-shadow: inset 1px 1px rgba(255, 255, 255, 0.2), inset -1px -1px rgba(0, 0, 0, 0.55), 0 2px 1px #000;
  color: #c9c9d0;
  font: 700 0.47rem/1 Arial, sans-serif;
  letter-spacing: 0.04em;
  text-decoration: none;
  cursor: pointer;
}

a.console-menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.console-menu-button:active {
  transform: translateY(1px);
  background: linear-gradient(165deg, #24242a, #45454d);
  box-shadow: inset 1px 2px 2px #09090b;
}

.console-volume {
  width: 0.9rem;
  min-width: 0.9rem;
  height: 0.9rem;
  padding: 0;
  border-radius: 50%;
  font-size: 0.6rem;
}

.console-volume-label {
  margin: 0 -0.3rem;
  color: #9999a2;
  font: 700 0.55rem/1 Arial, sans-serif;
  letter-spacing: 0.06em;
}

.console-home,
.console-option {
  min-width: 3.15rem;
  height: 1.7rem;
  border-radius: 0.08rem 0.08rem 50% 50%;
  font-size: 0.52rem;
}

.console-option {
  min-width: 3.45rem;
}

.console-mark {
  display: block;
  width: 9.5rem;
  height: auto;
  filter: brightness(0) invert(1);
}
</style>
