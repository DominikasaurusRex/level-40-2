<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { areaNames } from '@/data/areas'
import { badgeIcons } from '@/data/badges'
import { useGameStore } from '@/stores/game'
import { playSound } from '@/audio/sounds'

const game = useGameStore()
const earnedAreas = computed(() => areaNames.filter(area => game.hasBadge(area)))
const BADGE_LANDING_SOUND_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ? 0
  : 1_800 * 0.63
const badgeSoundTimers = new Set<ReturnType<typeof setTimeout>>()

onBeforeUnmount(() => {
  for (const timer of badgeSoundTimers) clearTimeout(timer)
})

/** Uses layout coordinates because the entire console may be visually scaled by App.vue. */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement): { x: number; y: number } {
  let x = 0
  let y = 0
  let current: HTMLElement | null = element

  while (current && current !== ancestor) {
    x += current.offsetLeft
    y += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  return {x, y}
}

function prepareBadgeEntrance(element: Element) {
  const soundTimer = setTimeout(() => {
    badgeSoundTimers.delete(soundTimer)
    playSound('badge-drop')
  }, BADGE_LANDING_SOUND_MS)
  badgeSoundTimers.add(soundTimer)

  const badge = element as HTMLElement
  const playfield = badge.closest('.game-window') as HTMLElement | null
  if (!playfield) return

  const badgePosition = offsetWithin(badge, playfield)
  const startX = playfield.offsetWidth / 2 - (badgePosition.x + badge.offsetWidth / 2)
  const startY = playfield.offsetHeight / 2 - (badgePosition.y + badge.offsetHeight / 2)
  badge.style.setProperty('--badge-start-x', `${startX}px`)
  badge.style.setProperty('--badge-start-y', `${startY}px`)
}
</script>

<template>
  <TransitionGroup
    name="badge-drop"
    tag="div"
    class="badge-shelf"
    @before-enter="prepareBadgeEntrance"
  >
    <button
      v-for="area in earnedAreas"
      :key="area"
      type="button"
      class="badge"
      :aria-label="`Reclaimed ${area}: +2 Power`"
    >
      <img class="badge-icon" :src="badgeIcons[area]" :alt="area">
      <div class="badge-tooltip" role="tooltip">
        <strong>Reclaimed {{ area }}</strong>
        <span>+2 Power</span>
      </div>
    </button>
  </TransitionGroup>
</template>

<style scoped>
.badge-shelf {
  flex: 1;
  min-width: 0;
  margin-left: -0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
  height: 100%;
}

.badge {
  position: relative;
  flex: 0 1 auto;
  min-height: 0;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.badge-drop-enter-active {
  z-index: 30;
  transform-origin: center;
  pointer-events: none;
  will-change: transform, filter, opacity;
  animation: badge-drop-in 1800ms linear both;
}

.badge-drop-enter-active::after {
  position: absolute;
  inset: -18%;
  border: 0.18rem solid rgba(255, 245, 163, 0.82);
  border-radius: 50%;
  content: '';
  opacity: 0;
  pointer-events: none;
  animation: badge-landing-ring 1800ms ease-out both;
}

@keyframes badge-drop-in {
  0% {
    opacity: 0;
    transform: translate(var(--badge-start-x, -14rem), var(--badge-start-y, 8rem)) scale(6);
    filter: brightness(2) drop-shadow(0 0 1rem rgba(255, 245, 163, 0.95));
  }
  8% {
    opacity: 1;
  }
  28% {
    opacity: 1;
    transform: translate(var(--badge-start-x, -14rem), var(--badge-start-y, 8rem)) scale(6);
    filter: brightness(1.5) drop-shadow(0 0 1.25rem rgba(255, 245, 163, 0.8));
  }
  57% {
    transform: translate(0, -0.65rem) scale(1.12);
    filter: brightness(1.18) drop-shadow(0 0.7rem 0.45rem rgba(0, 0, 0, 0.62));
  }
  63% {
    transform: translate(0, 0) scale(1.08, 0.92);
    filter: brightness(1.08) drop-shadow(0 0.18rem 0.22rem rgba(0, 0, 0, 0.68));
  }
  69% {
    transform: translate(0, 0) scale(1);
    filter: brightness(1) drop-shadow(0 0.35rem 0.5rem rgba(0, 0, 0, 0.5));
  }
  80% {
    transform: translate(0, -0.8rem) scale(0.98, 1.03);
  }
  88% {
    transform: translate(0, 0) scale(1.04, 0.96);
  }
  94% {
    transform: translate(0, -0.24rem) scale(0.995, 1.01);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
    filter: drop-shadow(0 0.35rem 0.5rem rgba(0, 0, 0, 0.5));
  }
}

@keyframes badge-landing-ring {
  0%, 61% {
    opacity: 0;
    transform: scale(0.65);
  }
  63% {
    opacity: 0.9;
  }
  73% {
    opacity: 0;
    transform: scale(1.45);
  }
  100% {
    opacity: 0;
  }
}

.badge-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0.35rem 0.5rem rgba(0, 0, 0, 0.5));
}

.badge-tooltip {
  position: absolute;
  right: calc(100% + 0.75rem);
  top: 50%;
  width: 145px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem;
  border: 2px solid var(--ui-border);
  border-radius: 0.35rem;
  background: linear-gradient(145deg, rgba(10, 84, 103, 0.94), rgba(2, 42, 65, 0.95));
  color: var(--ui-text);
  font-size: 0.7rem;
  line-height: 1.3;
  text-align: center;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translate(0.25rem, -50%);
  transition: opacity 120ms ease, transform 120ms ease;
  z-index: 2;
}

.badge:hover .badge-tooltip,
.badge:focus-visible .badge-tooltip {
  opacity: 1;
  transform: translate(0, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .badge-drop-enter-active {
    animation: none;
  }

  .badge-drop-enter-active::after {
    animation: none;
  }
}
</style>
