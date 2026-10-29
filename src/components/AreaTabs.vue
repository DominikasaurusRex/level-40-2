<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Monster } from '@/types/monster'
import { fieldMonsters } from '@/data/monster/field-monsters.ts'
import { forestMonsters } from '@/data/monster/forest-monsters.ts'
import { caveMonsters } from '@/data/monster/cave-monsters.ts'
import { wastelandMonsters } from '@/data/monster/wasteland-monsters.ts'
import { ruinsMonsters } from '@/data/monster/ruins-monsters.ts'
import { dungeonMonsters } from '@/data/monster/dungeon-monsters.ts'
import { hellMonsters } from '@/data/monster/hell-monsters.ts'
import { abyssMonsters } from '@/data/monster/abyss-monsters.ts'
import { areaNames, isAreaBossLevel, levelsForArea } from '@/data/areas'
import { areaBackgrounds } from '@/data/area-backgrounds'
import { useGameStore } from '@/stores/game'
import { playSound } from '@/audio/sounds'
import { trainingDummy } from '@/data/monster/tutorial-monster'
import BattleCard from './BattleCard.vue'

const game = useGameStore()

const emit = defineEmits<{
  resize: [height: number]
}>()

const areas = areaNames.map(name => ({ name, background: areaBackgrounds[name], levels: levelsForArea(name) }))

const monstersByArea: Record<string, Monster[]> = {
  Field: fieldMonsters,
  Forest: forestMonsters,
  Cave: caveMonsters,
  Wasteland: wastelandMonsters,
  Ruins: ruinsMonsters,
  Dungeon: dungeonMonsters,
  Hell: hellMonsters,
  Abyss: abyssMonsters,
}

function monsterFor(area: (typeof areas)[number], level: number) {
  if (level === 0) return trainingDummy
  return monstersByArea[area.name]?.[level - area.levels[0]!]
}

const battleCardHostEl = ref<HTMLElement>()
const battleCardRef = ref<InstanceType<typeof BattleCard>>()

const cardHeight = ref(0)
const areaColWidth = ref(0)
const fullAreaColumn = ref<HTMLElement>()

defineExpose({ battleCardHostEl, battleCardRef })

const activeAreaConfig = computed(() => areas.find(area => area.name === game.activeArea)!)

watch(
  () => monsterFor(activeAreaConfig.value, game.activeLevel),
  monster => monster && game.startFight(monster),
  { immediate: true },
)

const visibleAreas = computed(() => areas.filter(area => game.isAreaUnlocked(area.name)))

function visibleLevels(area: (typeof areas)[number]) {
  return area.levels.filter(level => game.isLevelUnlocked(level))
}

function playLevelSelectionSound(area: (typeof areas)[number], level: number) {
  playSound('close')
  if (isAreaBossLevel(area.name, level)) playSound('boss')
}

function selectArea(area: (typeof areas)[number]) {
  if (game.isTutorialActive) return
  const unlockedLevels = visibleLevels(area)
  const level = unlockedLevels[unlockedLevels.length - 1]!
  playLevelSelectionSound(area, level)
  game.activeArea = area.name
  game.activeLevel = level
}

function selectLevel(level: number) {
  if (game.isTutorialActive) return
  playLevelSelectionSound(activeAreaConfig.value, level)
  game.activeLevel = level
}

let resizeObserver: ResizeObserver | undefined

const cardStyle = computed(() => cardHeight.value
  ? {
      width: `${cardHeight.value * 0.8}px`,
      height: `${cardHeight.value}px`,
    }
  : undefined,
)

function syncCardSize() {
  if (!fullAreaColumn.value) return

  cardHeight.value = fullAreaColumn.value.offsetHeight
  areaColWidth.value = fullAreaColumn.value.offsetWidth
  emit('resize', cardHeight.value)
}

onMounted(async () => {
  await nextTick()
  syncCardSize()

  resizeObserver = new ResizeObserver(syncCardSize)
  resizeObserver.observe(fullAreaColumn.value!)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="area-shell">
    <div class="area-tab-col" :style="areaColWidth ? { minWidth: `${areaColWidth}px` } : undefined">
      <template v-for="area in visibleAreas" :key="area.name">
        <button
          class="area-tab"
          :class="{ active: area.name === game.activeArea }"
          :disabled="game.isTutorialActive"
          @click="selectArea(area)"
        >
          {{ area.name }}
        </button>

        <Transition name="level-tabs">
          <div v-if="area.name === game.activeArea" class="level-tab-reveal">
            <div class="level-tab-col level-tab-stack">
              <button
                v-for="level in visibleLevels(area)"
                :key="level"
                class="level-tab"
                :class="{ active: level === game.activeLevel }"
                :disabled="game.isTutorialActive"
                @click="selectLevel(level)"
              >
                <img v-if="level % 5 === 0" class="level-tab-icon" src="/icons/boss.png" alt="Boss" />
                <template v-else>{{ level }}</template>
              </button>
            </div>
          </div>
        </Transition>
      </template>
    </div>

    <div ref="fullAreaColumn" class="area-tab-col area-tab-col-measure" aria-hidden="true">
      <template v-for="area in areas" :key="area.name">
        <button class="area-tab">{{ area.name }}</button>

        <div v-if="area.name === game.activeArea" class="level-tab-col level-tab-stack">
          <button v-for="level in area.levels" :key="level" class="level-tab" />
        </div>
      </template>
    </div>

    <div ref="battleCardHostEl" class="battle-card-host">
      <BattleCard
        ref="battleCardRef"
        :background="activeAreaConfig.background"
        :battle-phase="game.battlePhase"
        :monster="game.monster"
        :monster-state="game.monsterState"
        :player-state="game.playerState"
        :style="cardStyle"
      />
    </div>
  </div>
</template>

<style scoped>
.area-shell {
  display: flex;
  align-items: flex-start;
}

.area-tab-col {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-right: -4px;
  z-index: 0;
}

.battle-card-host {
  position: relative;
  z-index: 1;
}

.area-tab-col-measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

.area-tab {
  position: relative;
  padding: 0.5rem 1rem;
  border: 3px solid var(--ui-ink);
  border-right: none;
  border-radius: 0.5rem 0 0 0.5rem;
  background: rgba(8, 91, 116, 0.82);
  color: var(--ui-text);
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  text-shadow: 0 1px 2px var(--ui-ink);
  box-shadow: inset 0 1px rgba(174, 211, 215, 0.12);
}

.area-tab:not(:first-child) {
  margin-top: 0.5rem;
}

.area-tab.active {
  background: linear-gradient(90deg, #f0f080, #cbdc67);
  color: var(--ui-ink);
  text-shadow: none;
  box-shadow: inset 0 0 0.75rem rgba(255, 255, 215, 0.45), 0 0 0.65rem rgba(49, 226, 212, 0.24);
}

.area-tab:disabled,
.level-tab:disabled {
  cursor: default;
}

.level-tab-col {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
}

.level-tab-stack {
  margin-left: 1rem;
  padding-left: 0;
  border: 2px solid var(--ui-ink);
  border-right: 0;
  border-radius: 1.4rem 0 0 1.4rem / 50% 0 0 50%;
  background: var(--ui-ink);
  overflow: hidden;
}

.level-tab-reveal {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transform: translateX(0);
  transition:
    grid-template-rows 280ms ease,
    opacity 180ms ease,
    transform 280ms ease;
}

.level-tab-reveal > .level-tab-col {
  min-height: 0;
  overflow: hidden;
}

.level-tabs-enter-from,
.level-tabs-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateX(-0.75rem);
}

@media (prefers-reduced-motion: reduce) {
  .level-tab-reveal {
    transition: none;
  }
}

.level-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0.2rem 0.75rem;
  border: 0;
  border-bottom: 2px solid var(--ui-ink);
  border-radius: 0;
  background: rgba(5, 67, 94, 0.84);
  color: var(--ui-text);
  font-size: 0.75rem;
  cursor: pointer;
}

/* Continue the selectors beneath the battle card without affecting layout or label position. */
.area-tab::after,
.level-tab::after {
  content: '';
  position: absolute;
  right: -18px;
  width: 20px;
  box-sizing: border-box;
  background: inherit;
  pointer-events: none;
}

.area-tab::after {
  top: -3px;
  bottom: -3px;
  border-top: 3px solid var(--ui-ink);
  border-bottom: 3px solid var(--ui-ink);
}

.level-tab::after {
  top: 0;
  bottom: -2px;
  border-bottom: 2px solid var(--ui-ink);
}

.level-tab:last-child,
.level-tab:last-child::after {
  border-bottom: 0;
}

.level-tab.active {
  background: linear-gradient(90deg, #e9ee78, #bdcf5e);
  color: var(--ui-ink);
}

.level-tab-icon {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  object-fit: contain;
}
</style>
