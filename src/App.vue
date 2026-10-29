<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { preloadSounds } from '@/audio/sounds'
import GameWindow from './components/GameWindow.vue'

const PAGE_PADDING = 32

const gameWindow = ref<HTMLElement>()
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const scale = ref(1)

let resizeObserver: ResizeObserver | undefined

const frameStyle = computed(() => ({
  width: `${naturalWidth.value * scale.value}px`,
  height: `${naturalHeight.value * scale.value}px`,
}))

const gameWindowStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}))

function fitGameWindow() {
  if (!gameWindow.value) return

  naturalWidth.value = gameWindow.value.offsetWidth
  naturalHeight.value = gameWindow.value.offsetHeight

  const consoleScreen = gameWindow.value.querySelector<HTMLElement>('.console-screen')
  if (!consoleScreen) return

  const availableWidth = document.documentElement.clientWidth - PAGE_PADDING
  const availableHeight = document.documentElement.clientHeight - PAGE_PADDING

  const fullConsoleFits = naturalWidth.value <= availableWidth
    && naturalHeight.value <= availableHeight

  if (fullConsoleFits) {
    // Once the whole device fits, grow it to make full use of larger and high-DPI displays.
    scale.value = Math.min(
      availableWidth / naturalWidth.value,
      availableHeight / naturalHeight.value,
    )
  } else {
    // Fit the playable screen and crop the surrounding body like a close-up.
    scale.value = Math.min(
      1,
      availableWidth / consoleScreen.offsetWidth,
      availableHeight / consoleScreen.offsetHeight,
    )
  }
}

onMounted(async () => {
  preloadSounds()
  await nextTick()
  fitGameWindow()

  resizeObserver = new ResizeObserver(fitGameWindow)
  resizeObserver.observe(gameWindow.value!)
  window.addEventListener('resize', fitGameWindow)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', fitGameWindow)
})
</script>

<template>
  <main class="area">
    <div class="game-window-frame" :style="frameStyle">
      <div ref="gameWindow" class="game-window-scale" :style="gameWindowStyle">
        <GameWindow />
      </div>
    </div>
  </main>
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
</style>

<style scoped>
.area {
  display: flex;
  min-height: 100dvh;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
  background:
    radial-gradient(circle at center, transparent 45%, rgba(17, 11, 8, 0.22) 100%),
    linear-gradient(rgba(20, 13, 9, 0.08), rgba(20, 13, 9, 0.08)),
    #9f6a4d url('/background.webp') center / cover no-repeat;
}

.game-window-frame {
  flex: none;
}

.game-window-scale {
  display: inline-block;
  transform-origin: top left;
}
</style>
