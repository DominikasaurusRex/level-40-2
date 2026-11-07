<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { playSound } from '@/audio/sounds'

const props = withDefaults(defineProps<{
  message: string
  target?: HTMLElement | null
  /** Optional click target when the visual spotlight surrounds a larger element. */
  allowedTarget?: HTMLElement | null
  /** Extra space around the target, including visual effects that do not affect its layout box. */
  spotlightPadding?: number
  speaker?: string
  portrait?: string
  actionLabel?: string
  dialoguePosition?: 'top' | 'bottom'
}>(), {
  target: null,
  allowedTarget: undefined,
  spotlightPadding: 6,
  speaker: 'Gatekeeper',
  portrait: '/cutscene/guard.png',
  actionLabel: undefined,
  dialoguePosition: 'bottom',
})

const emit = defineEmits<{
  action: []
}>()

const overlayEl = ref<HTMLElement>()
const spotlight = reactive({ top: 0, left: 0, width: 0, height: 0 })
const hasTarget = computed(() => Boolean(props.target && spotlight.width && spotlight.height))
let resizeObserver: ResizeObserver | undefined

function updateSpotlight() {
  const overlay = overlayEl.value
  const target = props.target
  const coordinateRoot = overlay?.offsetParent
  if (!overlay || !target || !(coordinateRoot instanceof HTMLElement)) {
    spotlight.width = 0
    spotlight.height = 0
    return
  }

  let left = 0
  let top = 0
  let current: HTMLElement | null = target
  while (current && current !== coordinateRoot) {
    left += current.offsetLeft
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  if (current !== coordinateRoot) {
    spotlight.width = 0
    spotlight.height = 0
    return
  }

  spotlight.left = Math.max(0, left - props.spotlightPadding)
  spotlight.top = Math.max(0, top - props.spotlightPadding)
  spotlight.width = Math.min(
    target.offsetWidth + props.spotlightPadding * 2,
    overlay.offsetWidth - spotlight.left,
  )
  spotlight.height = Math.min(
    target.offsetHeight + props.spotlightPadding * 2,
    overlay.offsetHeight - spotlight.top,
  )
}

function observeTarget() {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(updateSpotlight)
  if (overlayEl.value) resizeObserver.observe(overlayEl.value)
  if (props.target) resizeObserver.observe(props.target)
  updateSpotlight()
}

function isOverlayControl(target: Node | null): boolean {
  return Boolean(target && overlayEl.value?.querySelector('.tutorial-dialogue')?.contains(target))
}

/** Capture is the final guard against clicks landing outside the four visual blockers. */
function blockUnapprovedClick(event: MouseEvent) {
  const clicked = event.target as Node | null
  const allowedTarget = props.allowedTarget === undefined ? props.target : props.allowedTarget
  if (isOverlayControl(clicked) || (allowedTarget && clicked && allowedTarget.contains(clicked))) return

  event.preventDefault()
  event.stopImmediatePropagation()
}

function takeAction() {
  playSound('normal-click')
  emit('action')
}

watch(() => props.target, async () => {
  await nextTick()
  observeTarget()
})

onMounted(() => {
  observeTarget()
  window.addEventListener('resize', updateSpotlight)
  window.addEventListener('click', blockUnapprovedClick, true)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateSpotlight)
  window.removeEventListener('click', blockUnapprovedClick, true)
})
</script>

<template>
  <section
    ref="overlayEl"
    class="tutorial-overlay"
    :class="`dialogue-at-${dialoguePosition}`"
    aria-label="Tutorial"
    :style="{
      '--spotlight-top': `${spotlight.top}px`,
      '--spotlight-left': `${spotlight.left}px`,
      '--spotlight-width': `${spotlight.width}px`,
      '--spotlight-height': `${spotlight.height}px`,
    }"
  >
    <div v-if="!hasTarget" class="click-blocker click-blocker-full" aria-hidden="true" />
    <template v-else>
      <div class="click-blocker blocker-top" aria-hidden="true" />
      <div class="click-blocker blocker-left" aria-hidden="true" />
      <div class="click-blocker blocker-right" aria-hidden="true" />
      <div class="click-blocker blocker-bottom" aria-hidden="true" />
      <div class="spotlight-ring" aria-hidden="true" />
    </template>

    <img class="tutorial-portrait" :src="portrait" :alt="speaker" />
    <div class="tutorial-dialogue" :class="`dialogue-${dialoguePosition}`" role="dialog" aria-modal="true">
      <div class="tutorial-speaker">{{ speaker }}</div>
      <p aria-live="polite">{{ message }}</p>
      <button v-if="actionLabel" type="button" @click="takeAction">
        {{ actionLabel }} <span aria-hidden="true">▸</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.tutorial-overlay {
  position: absolute;
  inset: 0;
  z-index: 250;
  overflow: hidden;
  pointer-events: none;
  color: #fff5dc;
  font-family: Georgia, 'Times New Roman', serif;
}

.click-blocker {
  position: absolute;
  z-index: 0;
  background: rgba(1, 8, 14, 0.76);
  pointer-events: auto;
}

.click-blocker-full { inset: 0; }
.blocker-top { top: 0; right: 0; left: 0; height: var(--spotlight-top); }
.blocker-left {
  top: var(--spotlight-top);
  left: 0;
  width: var(--spotlight-left);
  height: var(--spotlight-height);
}
.blocker-right {
  top: var(--spotlight-top);
  right: 0;
  left: calc(var(--spotlight-left) + var(--spotlight-width));
  height: var(--spotlight-height);
}
.blocker-bottom {
  top: calc(var(--spotlight-top) + var(--spotlight-height));
  right: 0;
  bottom: 0;
  left: 0;
}

.spotlight-ring {
  position: absolute;
  top: var(--spotlight-top);
  left: var(--spotlight-left);
  z-index: 1;
  width: var(--spotlight-width);
  height: var(--spotlight-height);
  box-sizing: border-box;
  border: 3px solid #f6ef78;
  border-radius: 0.55rem;
  box-shadow: 0 0 0.65rem #31e2d4, inset 0 0 0.45rem rgba(246, 239, 120, 0.7);
  animation: tutorial-highlight 1.15s ease-in-out infinite alternate;
}

.tutorial-portrait {
  position: absolute;
  bottom: 5.8rem;
  left: 3rem;
  z-index: 2;
  max-width: 24%;
  max-height: 45%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 0.3rem 0.7rem rgba(0, 0, 0, 0.65));
}

.tutorial-dialogue {
  position: absolute;
  right: 1.25rem;
  left: 1.25rem;
  z-index: 3;
  min-height: 5.5rem;
  box-sizing: border-box;
  padding: 0.9rem 1.15rem 0.75rem;
  border: 2px solid #c4a370;
  background: rgba(19, 21, 24, 0.96);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 245, 220, 0.18);
  pointer-events: auto;
}

.dialogue-bottom { bottom: 1.15rem; }
.dialogue-top { top: 1.15rem; }

/* A top dialogue is used when the lesson spotlights the lower HP region.
   Keep the portrait large, but lower it so the box does not cover his face. */
.dialogue-at-top .tutorial-portrait {
  bottom: 0.5rem;
  max-height: 35%;
}

.tutorial-speaker {
  position: absolute;
  top: -1.2rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid #c4a370;
  background: #29231e;
  color: #f8dca2;
  font-size: 0.82rem;
  font-weight: bold;
}

.tutorial-dialogue p {
  min-height: 2.4rem;
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
  line-height: 1.35;
}

.tutorial-dialogue button {
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

.tutorial-dialogue button:hover,
.tutorial-dialogue button:focus-visible {
  color: #fff;
  outline: 1px solid #f8dca2;
}

@keyframes tutorial-highlight {
  from { filter: brightness(0.9); }
  to { filter: brightness(1.3); }
}

@media (prefers-reduced-motion: reduce) {
  .spotlight-ring { animation: none; }
}
</style>
