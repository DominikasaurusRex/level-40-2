<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { preloadSounds } from '@/audio/sounds'
import GameWindow from './components/GameWindow.vue'

const PAGE_PADDING = 32
/** A touch device whose short side is below this counts as a phone. */
const PHONE_MAX_SHORT_SIDE = 600

const gameWindow = ref<HTMLElement>()
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const scale = ref(1)
const isPhone = ref(false)
const isPortrait = ref(false)
/** On phones, the console screen's position and size inside the unscaled console. */
const screenOffset = ref({ x: 0, y: 0, width: 0, height: 0 })
/** On phones, the viewport size the console screen is centred in. */
const viewport = ref({ width: 0, height: 0 })

const coarsePointer = window.matchMedia('(pointer: coarse)')
const portrait = window.matchMedia('(orientation: portrait)')

let resizeObserver: ResizeObserver | undefined

const showRotateHint = computed(() => isPhone.value && isPortrait.value)

const frameStyle = computed(() => {
  if (isPhone.value) {
    return {
      width: `${viewport.value.width}px`,
      height: `${viewport.value.height}px`,
    }
  }
  return {
    width: `${naturalWidth.value * scale.value}px`,
    height: `${naturalHeight.value * scale.value}px`,
  }
})

const gameWindowStyle = computed(() => {
  if (isPhone.value) {
    // Centre the console screen in the viewport.
    const { x, y, width, height } = screenOffset.value
    const s = scale.value
    const left = (viewport.value.width - width * s) / 2 - x * s
    const top = (viewport.value.height - height * s) / 2 - y * s
    return { transform: `translate(${left}px, ${top}px) scale(${s})` }
  }
  return { transform: `scale(${scale.value})` }
})

/** Layout position ignoring transforms, per the offsetLeft/offsetTop rule for the scaled console. */
function layoutOffset(element: HTMLElement): { x: number; y: number } {
  let x = 0
  let y = 0
  for (let current: HTMLElement | null = element; current; current = current.offsetParent as HTMLElement | null) {
    x += current.offsetLeft
    y += current.offsetTop
  }
  return { x, y }
}

function updateDeviceMode() {
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight
  isPhone.value = coarsePointer.matches && Math.min(viewportWidth, viewportHeight) < PHONE_MAX_SHORT_SIDE
  isPortrait.value = portrait.matches
}

function fitGameWindow() {
  if (!gameWindow.value) return
  updateDeviceMode()

  naturalWidth.value = gameWindow.value.offsetWidth
  naturalHeight.value = gameWindow.value.offsetHeight

  const consoleScreen = gameWindow.value.querySelector<HTMLElement>('.console-screen')
  if (!consoleScreen) return

  if (isPhone.value) {
    // Phones show the console screen and its menu row, scaled to fill the viewport.
    viewport.value = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    }
    const screenPosition = layoutOffset(consoleScreen)
    const origin = layoutOffset(gameWindow.value)
    screenOffset.value = {
      x: screenPosition.x - origin.x,
      y: screenPosition.y - origin.y,
      width: consoleScreen.offsetWidth,
      height: consoleScreen.offsetHeight,
    }
    scale.value = Math.min(
      viewport.value.width / consoleScreen.offsetWidth,
      viewport.value.height / consoleScreen.offsetHeight,
    )
    return
  }

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

/** Browsers only honour this in fullscreen or installed apps; elsewhere the rotate hint covers it. */
function tryLockLandscape() {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (type: string) => Promise<void> }
  orientation?.lock?.('landscape').catch(() => {})
}

onMounted(async () => {
  preloadSounds()
  await nextTick()
  fitGameWindow()
  tryLockLandscape()

  resizeObserver = new ResizeObserver(fitGameWindow)
  resizeObserver.observe(gameWindow.value!)
  window.addEventListener('resize', fitGameWindow)
  portrait.addEventListener('change', fitGameWindow)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', fitGameWindow)
  portrait.removeEventListener('change', fitGameWindow)
})
</script>

<template>
  <main class="area" :class="{ phone: isPhone }">
    <div class="game-window-frame" :style="frameStyle">
      <div ref="gameWindow" class="game-window-scale" :style="gameWindowStyle">
        <GameWindow />
      </div>
    </div>
    <div v-if="showRotateHint" class="rotate-hint" role="alert">
      <span class="rotate-hint-icon" aria-hidden="true">⟳</span>
      Please turn your phone sideways.
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

.area.phone {
  padding: 0;
}

.game-window-frame {
  flex: none;
}

.game-window-scale {
  display: inline-block;
  transform-origin: top left;
}

.rotate-hint {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  background: #030507;
  color: #e5f1f9;
  font-size: 1.25rem;
  text-align: center;
}

.rotate-hint-icon {
  font-size: 3rem;
}
</style>
