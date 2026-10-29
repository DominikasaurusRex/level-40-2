<script setup lang="ts">
import { reactive, ref } from 'vue'
import { xpOrbThresholds } from '@/data/xp-orb-thresholds'

const ORB_SIZE = 12
const DEFAULT_BURST_RADIUS = 40
const STAGGER_MS = 45
const BURST_DURATION_MS = 90
const BASE_DURATION_MS = 550
const DURATION_VARIANCE_MS = 100
const SHRINK_START_FRACTION = 0.65

type Stage = 'center' | 'burst' | 'target'

interface Orb {
  id: number
  centerX: number
  centerY: number
  burstX: number
  burstY: number
  endX: number
  endY: number
  travelDuration: number
  shrinkDelay: number
  shrinkDuration: number
  stage: Stage
}

const orbLayerEl = ref<HTMLElement>()
const orbs = ref<Orb[]>([])
let nextOrbId = 0

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

function orbCountFor(amount: number): number {
  return xpOrbThresholds.filter(threshold => amount >= threshold).length
}

function moverStyle(orb: Orb) {
  const [x, y] = orb.stage === 'target' ? [orb.endX, orb.endY] : orb.stage === 'burst' ? [orb.burstX, orb.burstY] : [orb.centerX, orb.centerY]
  return {
    transform: `translate(${x}px, ${y}px)`,
    transitionDuration: `${orb.stage === 'target' ? orb.travelDuration : BURST_DURATION_MS}ms`,
  }
}

function spawn(amount: number, spawnPointEl: HTMLElement, targetPointEl: HTMLElement, burstRadius = DEFAULT_BURST_RADIUS) {
  const count = orbCountFor(amount)
  // .xp-orb-layer's own parent (.game-window) is the actual shared ancestor of spawnPointEl/targetPointEl —
  // .xp-orb-layer itself is just a sibling that happens to overlay it via `inset: 0`.
  const containerEl = orbLayerEl.value?.parentElement
  if (!containerEl || count === 0) return

  const spawnPoint = centerRelativeTo(spawnPointEl, containerEl)
  const targetPoint = centerRelativeTo(targetPointEl, containerEl)
  for (let i = 0; i < count; i++) {
    const id = nextOrbId++
    const travelDuration = BASE_DURATION_MS + (Math.random() * 2 - 1) * DURATION_VARIANCE_MS
    const startDelay = i * STAGGER_MS

    const orb = reactive<Orb>({
      id,
      centerX: spawnPoint.x - ORB_SIZE / 2,
      centerY: spawnPoint.y - ORB_SIZE / 2,
      burstX: spawnPoint.x + (Math.random() * 2 - 1) * burstRadius - ORB_SIZE / 2,
      burstY: spawnPoint.y + (Math.random() * 2 - 1) * burstRadius - ORB_SIZE / 2,
      endX: targetPoint.x - ORB_SIZE / 2,
      endY: targetPoint.y - ORB_SIZE / 2,
      travelDuration,
      shrinkDelay: travelDuration * SHRINK_START_FRACTION,
      shrinkDuration: travelDuration * (1 - SHRINK_START_FRACTION),
      stage: 'center',
    })
    orbs.value.push(orb)

    setTimeout(() => { orb.stage = 'burst' }, startDelay)
    setTimeout(() => { orb.stage = 'target' }, startDelay + BURST_DURATION_MS)
    setTimeout(() => {
      orbs.value = orbs.value.filter(o => o.id !== id)
    }, startDelay + BURST_DURATION_MS + travelDuration + 50)
  }
}

defineExpose({ spawn })
</script>

<template>
  <div ref="orbLayerEl" class="xp-orb-layer">
    <div
      v-for="orb in orbs"
      :key="orb.id"
      class="xp-orb-mover"
      :style="moverStyle(orb)"
    >
      <div
        class="xp-orb"
        :style="{
          transform: orb.stage === 'target' ? 'scale(0)' : 'scale(1)',
          transitionDuration: `${orb.shrinkDuration}ms`,
          transitionDelay: orb.stage === 'target' ? `${orb.shrinkDelay}ms` : '0ms',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.xp-orb-layer {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 5;
}

.xp-orb-mover {
  position: absolute;
  left: 0;
  top: 0;
  transition-property: transform;
  transition-timing-function: ease-out;
}

.xp-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--ui-ink);
  background: var(--ui-cyan);
  box-shadow: 0 0 0.3rem rgba(49, 226, 212, 0.9);
  transition-property: transform;
  transition-timing-function: ease-in;
}
</style>
