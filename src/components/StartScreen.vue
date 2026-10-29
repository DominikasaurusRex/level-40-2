<script setup lang="ts">
import { ref } from 'vue'
import MenuButton from './MenuButton.vue'
import NewGameConfirmation from './NewGameConfirmation.vue'

const emit = defineEmits<{
  continue: []
  newGame: []
  credits: []
}>()

const resetConfirmationOpen = ref(false)

function confirmNewGame() {
  resetConfirmationOpen.value = false
  emit('newGame')
}
</script>

<template>
  <section class="start-screen" aria-labelledby="game-title">
    <div class="start-screen-shade" aria-hidden="true" />

    <div class="start-content">
      <header class="title-lockup">
        <p class="title-kicker">A finite idle RPG</p>
        <h1 id="game-title" class="game-title">Level <strong>40</strong></h1>
      </header>

      <nav class="start-menu" aria-label="Main menu">
        <MenuButton @click="emit('continue')">
          Continue
        </MenuButton>
        <MenuButton @click="resetConfirmationOpen = true">
          New Game
        </MenuButton>
        <MenuButton @click="emit('credits')">
          Credits
        </MenuButton>
      </nav>
    </div>

    <div class="start-control-hints" aria-label="Console button guide">
      <div class="start-control-hint hint-home">
        <span>Home</span>
        <i aria-hidden="true" />
      </div>
      <div class="start-control-hint hint-volume">
        <span>Volume</span>
        <i aria-hidden="true" />
      </div>
      <div class="start-control-hint hint-menu">
        <span>Open menu in game</span>
        <span class="hint-menu-arrows" aria-hidden="true"><i /><i /></span>
      </div>
    </div>

    <Transition name="confirmation-fade">
      <NewGameConfirmation
        v-if="resetConfirmationOpen"
        @cancel="resetConfirmationOpen = false"
        @confirm="confirmNewGame"
      />
    </Transition>
  </section>
</template>

<style scoped>
.start-screen {
  position: absolute;
  inset: 0;
  display: grid;
  box-sizing: border-box;
  place-items: center;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #061d2c url('/areas/field_bg.webp') center / cover no-repeat;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.start-screen-shade {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgba(98, 238, 239, 0.035) 0 1px, transparent 1px 4px),
    radial-gradient(circle at 50% 34%, rgba(49, 226, 212, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(0, 24, 43, 0.16), rgba(1, 41, 60, 0.5) 54%, rgba(0, 14, 28, 0.84)),
    linear-gradient(90deg, rgba(0, 20, 38, 0.5), transparent 24% 76%, rgba(0, 20, 38, 0.5));
}

.start-content {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 22rem;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  transform: translateY(-0.5rem);
  text-align: center;
  text-shadow: 0 3px 0 var(--ui-ink), 0 0 1rem rgba(0, 16, 31, 0.95);
}

.title-lockup {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-kicker {
  margin: 0 0 0.15rem;
  color: var(--ui-muted);
  font: 700 0.7rem/1.2 Arial, sans-serif;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.game-title {
  margin: 0;
  font-size: 4.6rem;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.07em;
}

.game-title strong {
  color: var(--ui-active);
  font-size: 1.08em;
  font-weight: 700;
}

.start-menu {
  display: flex;
  width: 17rem;
  flex-direction: column;
  gap: 0.65rem;
}

.start-control-hints {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
  color: #fffbe6;
  font: 700 0.58rem/1.15 Arial, sans-serif;
  letter-spacing: 0.08em;
  -webkit-text-stroke: 2px #050805;
  paint-order: stroke fill;
  text-shadow: 0 2px 2px #000;
  text-transform: uppercase;
}

.start-control-hint {
  position: absolute;
  bottom: 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  animation:
    control-hint-bob 1.1s ease-in-out infinite,
    control-hint-flash 1.1s steps(2, end) infinite;
}

.hint-home {
  left: 1rem;
}

.hint-volume {
  left: 5rem;
}

.hint-menu {
  right: 0.5rem;
}

.start-control-hint > i,
.hint-menu-arrows i {
  width: 0;
  height: 0;
  border-right: 0.3rem solid transparent;
  border-left: 0.3rem solid transparent;
  border-top: 0.42rem solid #fffbe6;
  filter:
    drop-shadow(1px 0 0 #050805)
    drop-shadow(-1px 0 0 #050805)
    drop-shadow(0 1px 0 #050805)
    drop-shadow(0 -1px 0 #050805)
    drop-shadow(0 2px 1px #000);
}

.hint-menu-arrows {
  position: relative;
  width: 7.25rem;
  height: 0.42rem;
}

.hint-menu-arrows i {
  position: absolute;
  top: 0;
}

.hint-menu-arrows i:first-child {
  left: 1.2rem;
}

.hint-menu-arrows i:last-child {
  right: 1.35rem;
}

@keyframes control-hint-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-0.22rem);
  }
}

@keyframes control-hint-flash {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.38;
  }
}

@media (prefers-reduced-motion: reduce) {
  .start-control-hint {
    animation: none;
  }
}

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

@media (prefers-reduced-motion: reduce) {
  .confirmation-fade-enter-active,
  .confirmation-fade-leave-active {
    transition: none;
  }
}

</style>
