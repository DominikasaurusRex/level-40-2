<script setup lang="ts">
import { reactive, ref } from 'vue'
import { HIT_BURST_MS, HIT_HOLD_MS, HIT_TRAVEL_MS } from '@/combat/engine'

defineProps<{
  icon: string
}>()

const ICON_SIZE = 20
const SPAWN_JITTER = 26
const BURST_DURATION_MS = HIT_BURST_MS
const HOLD_DURATION_MS = HIT_HOLD_MS
const FLIGHT_DURATION_MS = HIT_TRAVEL_MS
const IMPACT_DURATION_MS = 150

type Stage = 'center' | 'burst' | 'target'

interface FlyingIcon {
  id: number
  centerX: number
  centerY: number
  burstX: number
  burstY: number
  endX: number
  endY: number
  stage: Stage
}

const layerEl = ref<HTMLElement>()
const icons = ref<FlyingIcon[]>([])
let nextIconId = 0

/** Position of `measuredEl`'s center, in `containerEl`'s local (untransformed) coordinate space — walking `offsetParent` ignores any ancestor CSS `transform`, unlike `getBoundingClientRect`. */
function centerRelativeTo(measuredEl: HTMLElement, containerEl: HTMLElement) {
  let x = measuredEl.offsetWidth / 2
  let y = measuredEl.offsetHeight / 2
  let ancestorEl: HTMLElement | null = measuredEl
  while (ancestorEl && ancestorEl !== containerEl) {
    x += ancestorEl.offsetLeft
    y += ancestorEl.offsetTop
    ancestorEl = ancestorEl.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function moverStyle(icon: FlyingIcon) {
  const [x, y] = icon.stage === 'target' ? [icon.endX, icon.endY] : icon.stage === 'burst' ? [icon.burstX, icon.burstY] : [icon.centerX, icon.centerY]
  return {
    transform: `translate(${x}px, ${y}px)`,
    transitionDuration: `${icon.stage === 'target' ? FLIGHT_DURATION_MS : BURST_DURATION_MS}ms`,
  }
}

/**
 * Launches `count` icons from `spawnPointEl` (the skill row that fired) to
 * `targetPointEl` (e.g. the enemy health bar, or the player's def badge),
 * one every `staggerMs` — pass the combat engine's `HIT_STAGGER_MS`/
 * `BUFF_STAGGER_MS` so icons land in step with the actual staggered
 * hits/points they represent. Each icon first bursts outward from the
 * exact spawn point to a scattered offset, then homes in on the target.
 */
function spawn(count: number, staggerMs: number, spawnPointEl: HTMLElement, targetPointEl: HTMLElement) {
  // This layer's own parent (.game-window) is the actual shared ancestor of spawnPointEl/targetPointEl —
  // the layer itself is just a sibling that happens to overlay it via `inset: 0`.
  const containerEl = layerEl.value?.parentElement
  if (!containerEl || count === 0) return

  const spawnPoint = centerRelativeTo(spawnPointEl, containerEl)
  const targetPoint = centerRelativeTo(targetPointEl, containerEl)

  for (let i = 0; i < count; i++) {
    const id = nextIconId++
    const startDelay = i * staggerMs

    const icon = reactive<FlyingIcon>({
      id,
      centerX: spawnPoint.x - ICON_SIZE / 2,
      centerY: spawnPoint.y - ICON_SIZE / 2,
      burstX: spawnPoint.x + (Math.random() * 2 - 1) * SPAWN_JITTER - ICON_SIZE / 2,
      burstY: spawnPoint.y + (Math.random() * 2 - 1) * SPAWN_JITTER - ICON_SIZE / 2,
      endX: targetPoint.x - ICON_SIZE / 2,
      endY: targetPoint.y - ICON_SIZE / 2,
      stage: 'center',
    })
    icons.value.push(icon)

    setTimeout(() => { icon.stage = 'burst' }, startDelay)
    setTimeout(() => { icon.stage = 'target' }, startDelay + BURST_DURATION_MS + HOLD_DURATION_MS)
    setTimeout(() => {
      icons.value = icons.value.filter(existing => existing.id !== id)
    }, startDelay + BURST_DURATION_MS + HOLD_DURATION_MS + FLIGHT_DURATION_MS + IMPACT_DURATION_MS + 50)
  }
}

defineExpose({ spawn })
</script>

<template>
  <div ref="layerEl" class="flying-icon-layer">
    <div
      v-for="flyingIcon in icons"
      :key="flyingIcon.id"
      class="flying-icon-mover"
      :style="moverStyle(flyingIcon)"
    >
      <img
        :src="icon"
        alt=""
        class="flying-icon"
        :style="{
          transform: flyingIcon.stage === 'target' ? 'scale(1.4)' : 'scale(1)',
          opacity: flyingIcon.stage === 'target' ? 0 : 1,
          transitionDuration: `${IMPACT_DURATION_MS}ms`,
          transitionDelay: flyingIcon.stage === 'target' ? `${FLIGHT_DURATION_MS}ms` : '0ms',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.flying-icon-layer {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 5;
}

.flying-icon-mover {
  position: absolute;
  left: 0;
  top: 0;
  transition-property: transform;
  /* Fast start, decelerating to a stop — reads as a burst landing and resting, not a slow creep. */
  transition-timing-function: ease-out;
}

.flying-icon {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
  transition-property: transform, opacity;
  transition-timing-function: ease-out;
}
</style>
