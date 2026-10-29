<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSaveStore } from '@/stores/save'
import { BUFF_STAGGER_MS, HIT_STAGGER_MS } from '@/combat/engine'
import { areaBackgrounds } from '@/data/area-backgrounds'
import { skillTreeChoices } from '@/data/skill-progression'
import { introCutscene, wolfCutscene, dragonCutscene, creditsCutscene, type Cutscene } from '@/data/cutscenes'
import { playSound } from '@/audio/sounds'
import AreaTabs from './AreaTabs.vue'
import PlayerTab from './PlayerTab.vue'
import BadgeShelf from './BadgeShelf.vue'
import XpOrbLayer from './XpOrbLayer.vue'
import FlyingIconLayer from './FlyingIconLayer.vue'
import LevelUpModal from './LevelUpModal.vue'
import MenuModal from './MenuModal.vue'
import CreditsModal from './CreditsModal.vue'
import ConsoleShell from './ConsoleShell.vue'
import StartScreen from './StartScreen.vue'
import SkillTreeModal from './SkillTreeModal.vue'
import CutsceneScreen from './CutsceneScreen.vue'
import EndingScreen from './EndingScreen.vue'
import TutorialOverlay from './TutorialOverlay.vue'
import { FOCUS_PULSE_MS } from '@/data/focus'

const game = useGameStore()
const saves = useSaveStore()

onUnmounted(() => {
  for (const timer of fadeTimers) clearTimeout(timer)
  saves.stop()
  game.stop()
})

const cardHeight = ref(0)
const menuOpen = ref(false)
const playerStatusOpen = ref(false)
const creditsOpen = ref(false)
const sessionStarted = ref(false)
const activeCutscene = ref<Cutscene>()
const pendingBossCutscene = ref<Cutscene>()
const resetFightAfterCutscene = ref(false)
const endingScreenOpen = ref(false)
const endingContinueReady = ref(false)
const screenFade = ref<'idle' | 'darkening' | 'brightening'>('idle')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const screenFadeSlow = ref(false)
type TutorialTarget = 'enemy-hp' | 'player-hp' | 'battle' | 'xp' | 'skills' | 'cooldown' | 'focus' | 'none'

interface TutorialStep {
  id: string
  message: string
  target: TutorialTarget
  actionLabel?: string
  dialoguePosition?: 'top' | 'bottom'
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'introduction',
    message: 'Before you face the creatures beyond this gate, you will learn how combat works.' +
      ' During a lesson, only the control I highlight can be used.',
    target: 'none',
    actionLabel: 'Begin training',
  },
  {
    id: 'enemy-health',
    message: 'The red bar across the top is the enemy\'s Health.' +
      ' Your attacks empty it. When it reaches zero, the enemy is defeated.',
    target: 'enemy-hp',
    actionLabel: 'Continue',
  },
  {
    id: 'player-health',
    message: 'The green bar across the bottom is your Health. Enemy attacks empty it.',
    target: 'player-hp',
    actionLabel: 'Continue',
    dialoguePosition: 'top',
  },
  {
    id: 'health-outcomes',
    message: 'Empty the enemy bar to win and earn XP. If your bar empties first, the fight restarts. You lose nothing when you die. I know crazy concept, right?',
    target: 'battle',
    actionLabel: 'Continue',
    dialoguePosition: 'top',
  },
  {
    id: 'experience',
    message: 'This is your Experience bar. Defeated enemies fill it with XP. When it fills, you gain a level and become stronger.',
    target: 'xp',
    actionLabel: 'Continue',
  },
  {
    id: 'skills',
    message: 'This list contains your Basic Attack and every skill you learn. They are automatic: each one activates by itself when ready.',
    target: 'skills',
    actionLabel: 'Continue',
  },
  {
    id: 'cooldown',
    message: 'The yellow bar is that ability\'s cooldown. It drains while the ability prepares, then refills when the ability activates.',
    target: 'cooldown',
    actionLabel: 'Continue',
  },
  {
    id: 'focus-explanation',
    message: 'The thin cyan bar is the Focus Pulse. One ability is Focused at a time. ' +
      'Its Pulse charges independently for three seconds and stays ready until you use it.',
    target: 'focus',
    actionLabel: 'Try the Pulse',
  },
  {
    id: 'focus-use',
    message: 'Wait until the cyan bar is full, then click Basic Attack. ' +
      'This spends the Pulse and removes up to three seconds from its cooldown. ' +
      'It does not attack out of the gate. You still gotta time it with the cooldown.',
    target: 'focus',
  },
  {
    id: 'complete',
    message: 'Good. Clicking a different ability focuses it and starts a fresh cyan charge. ' +
      'Clicking the already Focused ability spends its ready Pulse. You are ready for the Field.' +
      ' Try not to die now. I did have to spend time on you after all.',
    target: 'none',
    actionLabel: 'Enter the Field',
  },
]

const tutorialStepIndex = ref(0)
const tutorialStep = computed(() => tutorialSteps[tutorialStepIndex.value]!)

type LevelUpTutorialTarget = 'none' | 'skill-button' | 'tree' | 'power'

interface LevelUpTutorialStep {
  id: string
  message: string
  target: LevelUpTutorialTarget
  actionLabel?: string
}

const levelUpTutorialSteps: LevelUpTutorialStep[] = [
  {
    id: 'announce',
    message: 'Well, look at that — level 2 already. That means you\'ve earned your first real skill choice. Let\'s walk through it.',
    target: 'none',
    actionLabel: 'Continue',
  },
  {
    id: 'open-picker',
    message: 'Click that glowing box to open your skill tree and pick one.',
    target: 'skill-button',
  },
  {
    id: 'tree-overview',
    message: 'This is your skill tree. Strike, Guard, and Heal each branch out from here as you level up. Whatever you learn, you keep.',
    target: 'tree',
    actionLabel: 'Continue',
  },
  {
    id: 'prerequisites',
    message: 'Follow the arrows: a skill lights up once you own whatever feeds into it. Dim ones are still locked behind a prerequisite you don\'t have yet.',
    target: 'tree',
    actionLabel: 'Continue',
  },
  {
    id: 'power',
    message: 'That number up there is your Power. It scales every skill\'s numbers — gear up or level up and Power climbs, and so does your damage, your defense, your healing.',
    target: 'power',
    actionLabel: 'Got it',
  },
]

const levelUpTutorialStepIndex = ref(0)
const levelUpTutorialStep = computed(() => levelUpTutorialSteps[levelUpTutorialStepIndex.value]!)
const levelUpLessonDismissed = ref(false)
const fadeTimers: ReturnType<typeof setTimeout>[] = []

function fadeThroughBlack(switchScreen: () => void, afterReveal?: () => void, slow = false) {
  if (screenFade.value !== 'idle') return

  const fadeDurationMs = reducedMotion ? 0 : slow ? 920 : 360
  screenFadeSlow.value = slow
  screenFade.value = 'darkening'
  fadeTimers.push(setTimeout(() => {
    switchScreen()
    screenFade.value = 'brightening'
    fadeTimers.push(setTimeout(() => {
      screenFade.value = 'idle'
      screenFadeSlow.value = false
      afterReveal?.()
    }, fadeDurationMs))
  }, fadeDurationMs))
}

function toggleMenu() {
  if (!sessionStarted.value || activeCutscene.value || pendingBossCutscene.value || endingScreenOpen.value || screenFade.value !== 'idle') return
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) playerStatusOpen.value = false
}

function openPlayerStatus() {
  menuOpen.value = false
  playerStatusOpen.value = true
}

function openCredits() {
  menuOpen.value = false
  creditsOpen.value = true
}

function revealGame() {
  sessionStarted.value = true
  game.start()
  saves.start()
}

function closeCutscene() {
  fadeThroughBlack(() => {
    activeCutscene.value = undefined
    if (resetFightAfterCutscene.value && game.monster) game.startFight(game.monster)
    resetFightAfterCutscene.value = false
  }, () => {
    game.releaseCombatFromCutscene()
    game.start()
    saves.start()
  })
}

function finishCutscene() {
  if (activeCutscene.value?.id === 'credits') {
    if (screenFade.value !== 'idle') return
    fadeThroughBlack(() => {
      playSound('outro')
      activeCutscene.value = undefined
      if (resetFightAfterCutscene.value && game.monster) game.startFight(game.monster)
      resetFightAfterCutscene.value = false
      endingScreenOpen.value = true
      endingContinueReady.value = false
    }, () => {
      fadeTimers.push(setTimeout(() => { endingContinueReady.value = true }, 1600))
    }, true)
  } else {
    closeCutscene()
  }
}

function continueFromEnding() {
  if (!endingContinueReady.value || screenFade.value !== 'idle') return
  fadeThroughBlack(() => {
    endingScreenOpen.value = false
    endingContinueReady.value = false
  }, () => {
    game.releaseCombatFromCutscene()
    game.start()
    saves.start()
  })
}

watch(() => game.areaReclaimedEvent, event => {
  if (event) {
    playSound('reclaimed')
    const scene = event.area === 'Field' ? wolfCutscene
      : event.area === 'Dungeon' ? dragonCutscene
        : event.area === 'Abyss' ? creditsCutscene
          : undefined
    if (!scene) return
    pendingBossCutscene.value = scene
    game.holdCombatForCutscene()
    return
  }

  const scene = pendingBossCutscene.value
  pendingBossCutscene.value = undefined
  if (!scene || !game.combatHeldForCutscene) return
  game.stop()
  fadeThroughBlack(() => {
    activeCutscene.value = scene
    resetFightAfterCutscene.value = true
  })
})

function continueGame() {
  if (screenFade.value !== 'idle') return

  if (!saves.load()) {
    startNewGame()
    return
  }

  fadeThroughBlack(() => { sessionStarted.value = true }, revealGame)
}

function startNewGame() {
  game.stop()
  saves.stop()
  saves.reset()
  tutorialStepIndex.value = 0
  fadeThroughBlack(() => {
    menuOpen.value = false
    sessionStarted.value = true
    activeCutscene.value = introCutscene
  })
}

function newGame() {
  if (screenFade.value !== 'idle') return
  startNewGame()
}

const cardStyle = computed(() => cardHeight.value
  ? {
      width: `${cardHeight.value * 0.4}px`,
      height: `${cardHeight.value}px`,
    }
  : undefined,
)

const gameWindowStyle = computed(() => ({
  '--active-area-background': `url("${areaBackgrounds[game.activeArea].image}")`,
}))

const areaTabs = ref<InstanceType<typeof AreaTabs>>()
const playerTab = ref<InstanceType<typeof PlayerTab>>()
const levelUpModal = ref<InstanceType<typeof LevelUpModal>>()
const orbLayer = ref<InstanceType<typeof XpOrbLayer>>()
const attackIconLayer = ref<InstanceType<typeof FlyingIconLayer>>()
const defIconLayer = ref<InstanceType<typeof FlyingIconLayer>>()
const agiIconLayer = ref<InstanceType<typeof FlyingIconLayer>>()
const healIconLayer = ref<InstanceType<typeof FlyingIconLayer>>()

const tutorialTarget = computed<HTMLElement | null>(() => {
  const battleCard = areaTabs.value?.battleCardRef
  const target = tutorialStep.value.target

  if (target === 'enemy-hp') return battleCard?.enemyHealthBarEl ?? null
  if (target === 'player-hp') return battleCard?.playerHealthBarEl ?? null
  if (target === 'battle') return areaTabs.value?.battleCardHostEl ?? null
  if (target === 'xp') return playerTab.value?.xpBarEl ?? null
  if (target === 'skills') return playerTab.value?.skillListEl ?? null
  if (target === 'cooldown') return playerTab.value?.skillCooldownEl('basic-attack') ?? null
  if (target === 'focus') return playerTab.value?.skillRowEls['basic-attack'] ?? null
  return null
})

const tutorialAllowedTarget = computed<HTMLElement | null>(() =>
  tutorialStep.value.id === 'focus-use'
    ? playerTab.value?.skillFocusTargetEl('basic-attack') ?? null
    : null,
)

function advanceTutorial() {
  if (tutorialStep.value.id === 'complete') {
    game.completeTutorial()
    saves.saveNow()
    return
  }

  tutorialStepIndex.value = Math.min(tutorialStepIndex.value + 1, tutorialSteps.length - 1)
}

watch(() => game.focusChargeMs, (charge, previousCharge) => {
  if (
    tutorialStep.value.id === 'focus-use'
    && previousCharge >= FOCUS_PULSE_MS
    && charge === 0
  ) {
    advanceTutorial()
  }
})

const levelUpTutorialTarget = computed<HTMLElement | null>(() => {
  const target = levelUpTutorialStep.value.target

  if (target === 'skill-button') return levelUpModal.value?.skillRewardButtonEl ?? null
  if (target === 'tree') return levelUpModal.value?.skillTreeModal?.treeEl ?? null
  if (target === 'power') return levelUpModal.value?.skillTreeModal?.powerStatEl ?? null
  return null
})

const levelUpTutorialAllowedTarget = computed<HTMLElement | null>(() =>
  levelUpTutorialStep.value.id === 'open-picker' ? levelUpTutorialTarget.value : null,
)

function advanceLevelUpTutorial() {
  if (levelUpTutorialStepIndex.value >= levelUpTutorialSteps.length - 1) {
    levelUpLessonDismissed.value = true
    return
  }

  levelUpTutorialStepIndex.value += 1
}

watch(() => game.levelUpEvent?.id, () => {
  levelUpTutorialStepIndex.value = 0
  levelUpLessonDismissed.value = false
})

// The picker mounts on the player's own click (the 'open-picker' step leaves it as the only
// clickable control) — wait for its DOM to land before spotlighting anything inside it.
watch(() => levelUpModal.value?.skillPickerOpen, open => {
  if (open && levelUpTutorialStep.value.id === 'open-picker') advanceLevelUpTutorial()
}, { flush: 'post' })

watch(() => game.xpGainEvent, event => {
  const xpOrbSpawnEl = areaTabs.value?.battleCardRef?.xpOrbSpawnEl
  const xpBarEl = playerTab.value?.xpBarEl
  if (event && xpOrbSpawnEl && xpBarEl) {
    orbLayer.value?.spawn(event.amount, xpOrbSpawnEl, xpBarEl, game.monster?.xpOrbRadius)
  }
})

function acceptLevelUp(skillChoiceId?: string) {
  game.acceptLevelUp(skillChoiceId)
}

/**
 * Watches `.length` rather than the array itself so a batch of several
 * skills firing in the same tick still triggers exactly once — draining
 * with `splice(0)` then processes every queued attack from that batch,
 * not just the most recent one.
 */
watch(() => game.pendingPlayerAttacks.length, () => {
  const events = game.pendingPlayerAttacks.splice(0)
  const enemyHealthBarEl = areaTabs.value?.battleCardRef?.enemyHealthBarEl
  if (!enemyHealthBarEl) return

  for (const event of events) {
    const skillRowEl = playerTab.value?.skillRowEls[event.skillId]
    if (skillRowEl) attackIconLayer.value?.spawn(event.hits, HIT_STAGGER_MS, skillRowEl, enemyHealthBarEl)
  }
})

watch(() => game.pendingPlayerBuffs.length, () => {
  const events = game.pendingPlayerBuffs.splice(0)
  const playerDefBadgeEl = areaTabs.value?.battleCardRef?.playerDefBadgeEl
  if (!playerDefBadgeEl) return

  for (const event of events) {
    const skillRowEl = playerTab.value?.skillRowEls[event.skillId]
    if (skillRowEl) defIconLayer.value?.spawn(event.points, BUFF_STAGGER_MS, skillRowEl, playerDefBadgeEl)
  }
})

watch(() => game.pendingPlayerAgiBuffs.length, () => {
  const events = game.pendingPlayerAgiBuffs.splice(0)
  const playerAgiBadgeEl = areaTabs.value?.battleCardRef?.playerAgiBadgeEl
  if (!playerAgiBadgeEl) return

  for (const event of events) {
    const skillRowEl = playerTab.value?.skillRowEls[event.skillId]
    if (skillRowEl) agiIconLayer.value?.spawn(event.points, BUFF_STAGGER_MS, skillRowEl, playerAgiBadgeEl)
  }
})

watch(() => game.pendingPlayerHeals.length, () => {
  const events = game.pendingPlayerHeals.splice(0)
  const playerHealthBarEl = areaTabs.value?.battleCardRef?.playerHealthBarEl
  if (!playerHealthBarEl) return

  for (const event of events) {
    const skillRowEl = playerTab.value?.skillRowEls[event.skillId]
    if (skillRowEl) healIconLayer.value?.spawn(event.points, BUFF_STAGGER_MS, skillRowEl, playerHealthBarEl)
  }
})

/** Bleed consumes a displayed tick when it launches, then damages only after the attack icon reaches HP. */
watch(() => game.pendingBleedAttacks.length, () => {
  const events = game.pendingBleedAttacks.splice(0)
  const battleCard = areaTabs.value?.battleCardRef
  if (!battleCard) return

  for (const event of events) {
    const sourceEl = event.side === 'player'
      ? battleCard.playerStatusIconEls.bleed
      : battleCard.monsterStatusIconEls.bleed
    const targetEl = event.side === 'player'
      ? battleCard.playerHealthBarEl
      : battleCard.enemyHealthBarEl
    if (sourceEl && targetEl) attackIconLayer.value?.spawn(1, 0, sourceEl, targetEl)
  }
}, { flush: 'sync' })

/** Heal-over-time ticks mirror Bleed: each displayed tick flies from its status bubble and applies on arrival. */
watch(() => game.pendingHotHeals.length, () => {
  const events = game.pendingHotHeals.splice(0)
  const battleCard = areaTabs.value?.battleCardRef
  if (!battleCard) return

  for (const event of events) {
    const sourceEl = event.side === 'player'
      ? battleCard.playerStatusIconEls.heal
      : battleCard.monsterStatusIconEls.heal
    const targetEl = event.side === 'player'
      ? battleCard.playerHealthBarEl
      : battleCard.enemyHealthBarEl
    if (sourceEl && targetEl) healIconLayer.value?.spawn(1, 0, sourceEl, targetEl)
  }
}, { flush: 'sync' })
</script>

<template>
  <ConsoleShell @open-menu="toggleMenu">
    <!-- The bezel — a frame around the playfield. The level-up overlay is anchored to .game-frame
         (inset:0 stops at its padding edge, never the border itself) so it covers the entire area
         within the border, including .game-frame's own padding — not just .game-window's tighter box. -->
    <div class="game-frame">
      <StartScreen
        v-if="!sessionStarted"
        @continue="continueGame"
        @new-game="newGame"
        @credits="openCredits"
      />
      <template v-else>
        <div
          class="game-window"
          :class="{ 'showing-defeat': game.battlePhase === 'defeat', 'awaiting-cutscene': pendingBossCutscene }"
          :style="gameWindowStyle"
        >
          <AreaTabs ref="areaTabs" @resize="cardHeight = $event" />
          <PlayerTab
            ref="playerTab"
            :player="game.player"
            :skills="game.playerState.skills"
            :style="cardStyle"
            @open-player-status="openPlayerStatus"
          />
          <BadgeShelf />
          <XpOrbLayer ref="orbLayer" />
          <FlyingIconLayer ref="attackIconLayer" icon="/icons/attack.png" />
          <FlyingIconLayer ref="defIconLayer" icon="/icons/defense.png" />
          <FlyingIconLayer ref="agiIconLayer" icon="/icons/agi.png" />
          <FlyingIconLayer ref="healIconLayer" icon="/icons/heal.png" />
          <div
            v-if="game.areaReclaimedEvent || game.battlePhase === 'victory' || game.battlePhase === 'defeat'"
            class="battle-result"
            :class="game.areaReclaimedEvent ? 'battle-result-reclaimed' : `battle-result-${game.battlePhase}`"
            role="status"
            aria-live="assertive"
          >
            <span>{{
                game.areaReclaimedEvent ? 'Area Reclaimed'
                  : game.battlePhase === 'victory' ? 'Enemy Defeated'
                    : 'You Died'
              }}</span>
          </div>
        </div>
        <LevelUpModal
          v-if="game.levelUpEvent"
          ref="levelUpModal"
          :key="game.levelUpEvent.id"
          :level="game.levelUpEvent.level"
          :old-max-hp="game.levelUpEvent.oldMaxHp"
          :new-max-hp="game.levelUpEvent.newMaxHp"
          :old-power="game.levelUpEvent.oldPower"
          :new-power="game.levelUpEvent.newPower"
          :current-hp="game.playerState.hp"
          :current-max-hp="game.player.combatant.maxHp"
          :current-power="game.player.power"
          :weapons="game.levelUpEvent.weaponUpgrades"
          :skill-choices="game.levelUpEvent.skillChoices"
          :owned-skill-choice-ids="game.player.ownedSkillChoiceIds"
          @accept="acceptLevelUp"
        />
        <SkillTreeModal
          v-if="playerStatusOpen"
          title="Player Status"
          :current-hp="game.playerState.hp"
          :max-hp="game.player.combatant.maxHp"
          :power="game.player.power"
          :skill-choices="skillTreeChoices"
          :owned-skill-choice-ids="game.player.ownedSkillChoiceIds"
          @close="playerStatusOpen = false"
        />
        <Transition name="menu-fade">
          <MenuModal
            v-if="menuOpen"
            @close="menuOpen = false"
            @open-player-status="openPlayerStatus"
            @new-game="newGame"
            @open-credits="openCredits"
          />
        </Transition>
      </template>
      <CreditsModal v-if="creditsOpen" @close="creditsOpen = false" />
      <CutsceneScreen
        v-if="activeCutscene"
        :key="activeCutscene.id"
        :scene="activeCutscene"
        @close="finishCutscene"
      />
      <TutorialOverlay
        v-if="sessionStarted && game.isTutorialActive && !activeCutscene"
        :key="tutorialStep.id"
        :message="tutorialStep.message"
        :target="tutorialTarget"
        :allowed-target="tutorialAllowedTarget"
        :action-label="tutorialStep.actionLabel"
        :dialogue-position="tutorialStep.dialoguePosition"
        @action="advanceTutorial"
      />
      <TutorialOverlay
        v-if="game.isLevelUpTutorialActive && !levelUpLessonDismissed && !activeCutscene"
        :key="levelUpTutorialStep.id"
        :message="levelUpTutorialStep.message"
        :target="levelUpTutorialTarget"
        :allowed-target="levelUpTutorialAllowedTarget"
        :spotlight-padding="levelUpTutorialStep.id === 'open-picker' ? 24 : 6"
        :action-label="levelUpTutorialStep.actionLabel"
        @action="advanceLevelUpTutorial"
      />
      <EndingScreen
        v-if="endingScreenOpen"
        :continue-ready="endingContinueReady"
        @continue="continueFromEnding"
      />
      <div class="screen-fade" :class="[screenFade, { slow: screenFadeSlow }]" aria-hidden="true" />
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
  width: 50rem;
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

.screen-fade.slow {
  transition-duration: 880ms;
}

.screen-fade.darkening {
  opacity: 1;
  pointer-events: auto;
}

.screen-fade.brightening {
  pointer-events: auto;
}

.game-window {
  position: relative;
  z-index: 0;
  isolation: isolate;
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-items: flex-start;
  gap: 1rem;
  /* Room for PlayerTab's level badge, which pokes 0.5rem above .player-tab's top edge — without this
     the badge overflows outside this box, which is what both the viewport-fit sizing (App.vue measures
     .game-frame, which sizes to this element) and the level-up modal's `inset: 0` overlay (relative to
     this element) are sized to. An overflowing absolutely-positioned child doesn't count toward either,
     so it'd render un-scaled-with and un-darkened-by the rest of the game. */
  padding: 1.5rem 0.75rem 0.75rem;
  background: rgba(2, 28, 44, 0.2);
  overflow: hidden;
}

.game-window.awaiting-cutscene {
  pointer-events: none;
}

.game-window::before,
.game-window::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.game-window::before {
  inset: -0.75rem;
  z-index: -2;
  background: var(--active-area-background) center / cover no-repeat;
  filter: blur(0.35rem) saturate(0.8) brightness(0.94) hue-rotate(8deg);
}

.game-window::after {
  inset: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(0deg, rgba(98, 238, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(135deg, rgba(7, 79, 96, 0.48), rgba(19, 144, 148, 0.18) 46%, rgba(3, 51, 72, 0.48));
}

.battle-result {
  position: absolute;
  top: 42%;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.4rem;
  overflow: hidden;
  pointer-events: none;
  text-transform: uppercase;
}

.battle-result::before {
  position: absolute;
  inset: 0;
  content: '';
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  background: linear-gradient(90deg, transparent, rgba(1, 18, 29, 0.92) 18% 82%, transparent);
  transform-origin: center;
  animation: battle-result-band 180ms ease-out both;
}

.battle-result span {
  position: relative;
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1;
  text-shadow: 0 0 0.35rem #000, 0 2px 0 #000;
  animation: battle-result-text 700ms ease-out both;
}

.battle-result-victory {
  color: #eef07d;
}

.battle-result-reclaimed {
  color: #fff5a3;
}

.battle-result-reclaimed::before {
  background:
    linear-gradient(90deg, transparent, rgba(35, 73, 48, 0.94) 18% 82%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(238, 240, 125, 0.2) 50%, transparent 76%);
}

.battle-result-reclaimed span {
  font-size: 1.65rem;
  text-shadow: 0 0 0.45rem #7ea94a, 0 0 1rem rgba(238, 240, 125, 0.55), 0 2px 0 #000;
  animation-duration: 3200ms;
}

.battle-result-defeat {
  color: #ff7a82;
}

.battle-result-defeat span {
  animation-duration: 900ms;
}

.game-window.showing-defeat::after {
  z-index: 19;
  background:
    radial-gradient(circle, transparent 18%, rgba(68, 0, 14, 0.58) 100%),
    rgba(3, 8, 13, 0.3);
  animation: defeat-screen 900ms ease-out both;
}

@keyframes battle-result-band {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

@keyframes battle-result-text {
  0% { opacity: 0; transform: scale(1.4); filter: blur(0.2rem); }
  18% { opacity: 1; transform: scale(1); filter: blur(0); }
  76% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.96); }
}

@keyframes defeat-screen {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0.78; }
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

  .battle-result::before,
  .battle-result span,
  .game-window.showing-defeat::after {
    animation: none;
  }

  .menu-fade-enter-active,
  .menu-fade-leave-active {
    transition: none;
  }
}
</style>
