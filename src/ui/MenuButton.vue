<script setup lang="ts">
import { playSound, type SoundEffect } from '@/audio/sounds'

const props = withDefaults(defineProps<{
  compact?: boolean
  highlighted?: boolean
  danger?: boolean
  disabled?: boolean
  title?: string
  type?: 'button' | 'submit' | 'reset'
  sound?: SoundEffect
}>(), {
  compact: false,
  highlighted: false,
  danger: false,
  disabled: false,
  title: undefined,
  type: 'button',
  sound: 'normal-click',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  playSound(props.sound)
  emit('click', event)
}

function handlePointerDown() {
  if (props.disabled) playSound('error-click')
}
</script>

<template>
  <div
    class="menu-button-frame"
    :class="{
      'menu-button-compact': compact,
      'menu-button-highlighted': highlighted,
      'menu-button-danger': danger,
      'menu-button-disabled': disabled,
    }"
    @pointerdown="handlePointerDown"
  >
    <button
      class="menu-button"
      :disabled="disabled"
      :title="title"
      :type="type"
      @click="handleClick"
    >
      <slot />
    </button>
  </div>
</template>

<style scoped>
.menu-button-frame {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}

.menu-button-frame::before,
.menu-button-frame::after {
  position: absolute;
  z-index: 0;
  top: -1px;
  width: auto;
  height: 105%;
  aspect-ratio: 13.765524 / 16.959999;
  background: url('/icons/system/menu-button-side.svg') center / contain no-repeat;
  content: '';
  pointer-events: none;
}

.menu-button-frame::before {
  left: 0;
  transform: translateX(-80%) scaleX(-1);
}

.menu-button-frame::after {
  right: 0;
  transform: translateX(80%);
}

.menu-button {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0.62rem 1.5rem;
  border: 2px solid var(--ui-ink, #031a29);
  border-radius: 0;
  background: linear-gradient(105deg, rgba(23, 157, 166, 0.86), rgba(8, 99, 120, 0.82) 62%, rgba(4, 67, 92, 0.8));
  color: var(--ui-text, #dcfbfb);
  font: 700 1.05rem/1.2 Georgia, 'Times New Roman', serif;
  letter-spacing: 0.06em;
  cursor: pointer;
  text-shadow: 0 1px 2px #001622;
  box-shadow: inset 0 1px rgba(174, 211, 215, 0.12);
}

.menu-button-frame:hover:not(.menu-button-disabled) .menu-button,
.menu-button-highlighted:not(.menu-button-disabled) .menu-button,
.menu-button:focus-visible {
  background: linear-gradient(90deg, #eef07d, #bfd25e);
  color: var(--ui-ink, #031a29);
  text-shadow: none;
}

.menu-button-highlighted:not(.menu-button-disabled) {
  animation: menu-button-hint 1.3s ease-in-out infinite;
}

@keyframes menu-button-hint {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  .menu-button-highlighted:not(.menu-button-disabled) { animation: none; }
}

.menu-button-frame:active:not(.menu-button-disabled) {
  transform: translateY(2px);
}

.menu-button-danger .menu-button {
  background: linear-gradient(90deg, rgba(152, 58, 66, 0.88), rgba(78, 31, 48, 0.86));
}

.menu-button-danger:hover:not(.menu-button-disabled) .menu-button,
.menu-button-danger .menu-button:focus-visible {
  background: linear-gradient(90deg, #f18087, #a34259);
}

.menu-button-compact .menu-button {
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
}

.menu-button-disabled {
  opacity: 0.52;
}

.menu-button-disabled .menu-button {
  cursor: not-allowed;
}
</style>
