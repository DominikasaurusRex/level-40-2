<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import type { OriginalSaveInfo } from '@/stores/game'
import { useSaveStore } from '@/stores/save'
import MenuModal from '@/menu/MenuModal.vue'
import CreditsModal from '@/menu/CreditsModal.vue'
import ConsoleShell from '@/console/ConsoleShell.vue'
import StartScreen from '@/menu/StartScreen.vue'
import TownScreen from '@/town/TownScreen.vue'
import BattleScreen from '@/battle/BattleScreen.vue'

/** The screens shown once the start screen is left. */
enum GameScreen {
  Town = 'town',
  Battle = 'battle',
}

const saves = useSaveStore()

const menuOpen = ref(false)
const creditsOpen = ref(false)
const sessionStarted = ref(false)
const screen = ref(GameScreen.Town)
const screenFade = ref<'idle' | 'darkening' | 'brightening'>('idle')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fadeTimers: ReturnType<typeof setTimeout>[] = []

onUnmounted(() => {
  for (const timer of fadeTimers) clearTimeout(timer)
  saves.stop()
})

function fadeThroughBlack(switchScreen: () => void, afterReveal?: () => void) {
  if (screenFade.value !== 'idle') return

  const fadeDurationMs = reducedMotion ? 0 : 360
  screenFade.value = 'darkening'
  fadeTimers.push(setTimeout(() => {
    switchScreen()
    screenFade.value = 'brightening'
    fadeTimers.push(setTimeout(() => {
      screenFade.value = 'idle'
      afterReveal?.()
    }, fadeDurationMs))
  }, fadeDurationMs))
}

function toggleMenu() {
  if (!sessionStarted.value || screenFade.value !== 'idle') return
  menuOpen.value = !menuOpen.value
}

function openCredits() {
  menuOpen.value = false
  creditsOpen.value = true
}

function continueGame() {
  if (screenFade.value !== 'idle') return

  if (!saves.load()) {
    startNewGame()
    return
  }

  fadeThroughBlack(() => {
    sessionStarted.value = true
    screen.value = GameScreen.Town
  }, () => saves.start())
}

function startNewGame(originalSave?: OriginalSaveInfo) {
  saves.stop()
  saves.reset(originalSave)
  fadeThroughBlack(() => {
    menuOpen.value = false
    sessionStarted.value = true
    screen.value = GameScreen.Town
  }, () => saves.start())
}

function newGame(originalSave?: OriginalSaveInfo) {
  if (screenFade.value !== 'idle') return
  startNewGame(originalSave)
}

function embark() {
  fadeThroughBlack(() => {
    screen.value = GameScreen.Battle
  })
}
</script>

<template>
  <ConsoleShell @open-menu="toggleMenu">
    <div class="game-frame">
      <StartScreen
        v-if="!sessionStarted"
        :can-continue="saves.hasStoredGame()"
        @continue="continueGame"
        @new-game="newGame"
        @credits="openCredits"
      />
      <TownScreen v-else-if="screen === GameScreen.Town" @embark="embark" />
      <BattleScreen v-else />
      <Transition name="menu-fade">
        <MenuModal
          v-if="menuOpen"
          @close="menuOpen = false"
          @new-game="newGame"
          @open-credits="openCredits"
        />
      </Transition>
      <CreditsModal v-if="creditsOpen" @close="creditsOpen = false" />
      <div class="screen-fade" :class="screenFade" aria-hidden="true" />
    </div>
  </ConsoleShell>
</template>

<style scoped>
.game-frame {
  --ui-ink: #031a29;
  --ui-border: #07506a;
  --ui-border-soft: rgba(85, 151, 166, 0.46);
  --ui-panel: rgba(12, 91, 105, 0.7);
  --ui-panel-strong: rgba(6, 59, 78, 0.88);
  --ui-surface: rgba(18, 139, 155, 0.72);
  --ui-surface-deep: rgba(7, 82, 102, 0.8);
  --ui-active: #e5ec72;
  --ui-text: #dcfbfb;
  --ui-muted: #9ed8dc;
  --ui-track: rgba(1, 28, 45, 0.82);
  --ui-cyan: #31e2d4;
  --ui-enemy-hp: #d95b63;
  --ui-player-hp: #56d39a;
  position: relative;
  width: 57rem;
  height: 36rem;
  box-sizing: border-box;
  border: 4px solid #222;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #07090c;
}

.screen-fade {
  position: absolute;
  inset: 0;
  z-index: 400;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 320ms steps(8, end);
}

.screen-fade.darkening {
  opacity: 1;
  pointer-events: auto;
}

.screen-fade.brightening {
  pointer-events: auto;
}

.menu-fade-enter-active {
  transition: opacity 180ms ease-out;
}

.menu-fade-leave-active {
  transition: opacity 140ms ease-in;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .screen-fade {
    transition: none;
  }

  .menu-fade-enter-active,
  .menu-fade-leave-active {
    transition: none;
  }
}
</style>
