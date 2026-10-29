import {defineStore} from 'pinia'
import {computed, reactive, ref} from 'vue'
import type {CombatantState, SkillState} from '@/types/combatant'
import {createCombatantState, findStatus} from '@/types/combatant'
import type {Monster} from '@/types/monster'
import type {Weapon, WeaponSlot} from '@/types/weapon'
import {basicAttackSkill} from '@/types/weapon'
import type {SkillChoice} from '@/types/skill-progression'
import type {Player} from '@/types/player'
import {startingPlayer} from '@/data/player'
import {xpToNextPlayerLevel} from '@/data/player-xp-curve'
import {maxHpForPlayerLevel} from '@/data/player-hp-curve'
import {powerForPlayerLevel} from '@/data/player-power-curve'
import {healIconCountFor} from '@/data/heal-icon-thresholds'
import {FOCUS_PULSE_MS} from '@/data/focus'
import {resolveWeaponsForLevel, weaponUpgradeForLevel} from '@/data/weapons'
import {
  isSkillChoiceAvailable,
  isSkillChoiceId,
  skillChoiceLevels,
  skillsForPlayer,
  skillTreeChoices,
} from '@/data/skill-progression'
import {
  areaForLevel,
  type AreaName,
  isAreaBossLevel,
  isAreaName,
  isLevelInArea,
  levelsForArea
} from '@/data/areas'
import {advanceFight} from '@/combat/engine'
import {trainingDummy} from '@/data/monster/tutorial-monster'
import {fieldMonsters} from '@/data/monster/field-monsters'

const TICK_MS = 100
const MAX_PLAYER_LEVEL = 30
const MAX_AREA_LEVEL = 40
const BADGE_POWER_BONUS = 2

export type BattlePhase = 'fighting' | 'victory' | 'defeat' | 'spawning'
export const VICTORY_PAUSE_MS = 700
export const AREA_RECLAIMED_BANNER_MS = 3200
export const DEFEAT_PAUSE_MS = 900
export const RESPAWN_PAUSE_MS = 300

export interface GameSnapshot {
  activeArea: AreaName
  activeLevel: number
  activeWeapon: WeaponSlot
  level: number
  xp: number
  skills: string[]
  focusedSkill: string
  highestUnlockedLevel: number
  badges: AreaName[]
  /** Missing in older saves, which predate the tutorial and are treated as complete. */
  tutorialComplete?: boolean
  /** Missing in older saves, which predate this tutorial and are treated as complete. */
  levelUpTutorialComplete?: boolean
}

interface QueuedLevelUp {
  level: number
  oldMaxHp: number
  newMaxHp: number
  oldPower: number
  newPower: number
  weaponUpgrades?: Weapon[]
  grantsSkillChoice: boolean
  id: number
}

interface ActiveLevelUp extends Omit<QueuedLevelUp, 'grantsSkillChoice'> {
  skillChoices?: SkillChoice[]
}

function createNewPlayer(): Player {
  return {
    ...startingPlayer,
    ownedSkillChoiceIds: [...startingPlayer.ownedSkillChoiceIds],
    weapons: [...startingPlayer.weapons],
    combatant: {
      ...startingPlayer.combatant,
      skills: [...startingPlayer.combatant.skills],
    },
  }
}

/**
 * Owns the complete game state: player progression, area progression, and the
 * one live fight in progress. Ticks cooldowns, resolves
 * effects per `.doc/Simple RPG — Combat Stats & Skills.md`, and handles both
 * end conditions — monster defeated (award its xp, respawn a fresh one) and
 * player defeated (reset the fight, nothing lost).
 */
export const useGameStore = defineStore('game', () => {
  const player = reactive(createNewPlayer())
  const playerState = ref<CombatantState>(createCombatantState(player.combatant))
  const monster = ref<Monster>(trainingDummy)
  const monsterState = ref<CombatantState>(createCombatantState(trainingDummy.combatant))
  const battlePhase = ref<BattlePhase>('fighting')
  const activeArea = ref<AreaName>('Field')
  const activeLevel = ref(0)
  const highestUnlockedLevel = ref(1)
  const tutorialComplete = ref(false)
  const isTutorialActive = computed(() => !tutorialComplete.value && activeLevel.value === 0)
  const levelUpTutorialComplete = ref(false)
  const earnedBadgeIds = ref<AreaName[]>([])
  const focusedSkillId = ref('basic-attack')
  const focusChargeMs = ref(0)
  const focusedSkill = computed(() => playerState.value.skills.find(skill => skill.id === focusedSkillId.value))
  const focusPulseReady = computed(() => {
    const skill = focusedSkill.value
    return Boolean(skill && focusChargeMs.value >= FOCUS_PULSE_MS)
  })
  /** Bumped on every xp gain so the UI can react (e.g. spawn xp-orb animations) even if the amount repeats. */
  const xpGainEvent = ref<{ amount: number; id: number }>()
  const areaReclaimedEvent = ref<{ area: AreaName; id: number }>()
  const combatHeldForCutscene = ref(false)
  /** The level-up currently awaiting acknowledgement. Later level-ups wait in `queuedLevelUps`. */
  const levelUpEvent = ref<ActiveLevelUp>()
  /** The level 1->2 level-up grants the player's first skill choice; skillChoiceLevels' lowest entry is always 2. */
  const isLevelUpTutorialActive = computed(() =>
    !levelUpTutorialComplete.value
    && levelUpEvent.value?.level === 2
    && Boolean(levelUpEvent.value?.skillChoices?.length),
  )
  const queuedLevelUps: QueuedLevelUp[] = []
  /**
   * Queued whenever the player's own offensive skill fires, so the UI can
   * fly `hits` attack icons from that skill's row at the enemy — monster
   * attacks don't raise this. A queue, not a single "latest event" slot:
   * the player's skills cool down independently (e.g. basic-attack and
   * `slash`), so two can fire within the same tick — a single ref would
   * have the second overwrite the first before the UI's watcher ever saw
   * it, silently dropping that attack's icons.
   */
  const pendingPlayerAttacks = ref<{ skillId: string; hits: number; id: number }[]>([])
  const pendingPlayerBuffs = ref<{ skillId: string; points: number; id: number }[]>([])
  const pendingPlayerAgiBuffs = ref<{ skillId: string; points: number; id: number }[]>([])
  const pendingPlayerHeals = ref<{ skillId: string; points: number; id: number }[]>([])
  const pendingBleedAttacks = ref<{ side: 'player' | 'monster'; id: number }[]>([])
  const pendingHotHeals = ref<{ side: 'player' | 'monster'; id: number }[]>([])

  let intervalId: ReturnType<typeof setInterval> | undefined
  let xpGainCounter = 0
  let levelUpCounter = 0
  let playerAttackCounter = 0
  let playerBuffCounter = 0
  let playerAgiBuffCounter = 0
  let playerHealCounter = 0
  let bleedAttackCounter = 0
  let hotHealCounter = 0
  let battlePhaseRemainingMs = 0
  let areaReclaimedCounter = 0
  let areaReclaimedRemainingMs = 0

  function isLevelUnlocked(level: number): boolean {
    return level >= 1 && level <= MAX_AREA_LEVEL && level <= highestUnlockedLevel.value
  }

  function isAreaUnlocked(area: AreaName): boolean {
    return isLevelUnlocked(levelsForArea(area)[0]!)
  }

  function unlockNextLevelIfFrontierCleared() {
    if (activeLevel.value === highestUnlockedLevel.value && highestUnlockedLevel.value < MAX_AREA_LEVEL) {
      highestUnlockedLevel.value += 1
    }
  }

  function hasBadge(area: AreaName): boolean {
    return earnedBadgeIds.value.includes(area)
  }

  function totalPlayerPower(level: number): number {
    return powerForPlayerLevel.get(level)!
      + earnedBadgeIds.value.length * BADGE_POWER_BONUS
  }

  function refreshWeaponsAndSkills() {
    player.weapons = resolveWeaponsForLevel(player.level, player.power)
    const equippedUpgrade = player.weapons.find(weapon => weapon.slot === player.equippedWeaponSlot)!
    applyEquippedWeapon(equippedUpgrade)
    rebuildPlayerSkills()
  }

  function awardBadgeIfBossCleared(): boolean {
    if (isAreaBossLevel(activeArea.value, activeLevel.value) && !hasBadge(activeArea.value)) {
      earnedBadgeIds.value.push(activeArea.value)
      player.power = totalPlayerPower(player.level)
      refreshWeaponsAndSkills()
      return true
    }

    return false
  }

  function respawnMonster(next: Monster) {
    monster.value = next
    monsterState.value = createCombatantState(next.combatant)
  }

  function startFight(next: Monster) {
    playerState.value = createCombatantState(player.combatant)
    resetFocusCharge()
    respawnMonster(next)
    battlePhase.value = 'fighting'
    battlePhaseRemainingMs = 0
    areaReclaimedEvent.value = undefined
    areaReclaimedRemainingMs = 0
    combatHeldForCutscene.value = false
  }

  function holdCombatForCutscene() {
    combatHeldForCutscene.value = true
  }

  function releaseCombatFromCutscene() {
    combatHeldForCutscene.value = false
  }

  function resetFocusCharge() {
    focusChargeMs.value = 0
  }

  /**
   * Selects an unfocused ability, or consumes the selected ability's ready Pulse.
   * A Pulse skips up to three seconds once; the skill still fires through the normal combat tick.
   */
  function useFocus(skillId: string): boolean {
    if (battlePhase.value !== 'fighting' || combatHeldForCutscene.value) return false

    const skill = playerState.value.skills.find(candidate => candidate.id === skillId)
    if (!skill) return false

    if (skillId !== focusedSkillId.value) {
      focusedSkillId.value = skillId
      resetFocusCharge()
      return true
    }

    if (!focusPulseReady.value) return false

    skill.remaining = Math.max(0, skill.remaining - FOCUS_PULSE_MS)
    focusChargeMs.value = 0
    return true
  }

  function resetFocus(skillId = 'basic-attack') {
    focusedSkillId.value = skillId
    resetFocusCharge()
  }

  function updateFocus(dt: number) {
    const skill = focusedSkill.value
    if (!skill || findStatus(playerState.value, 'stun')) return
    focusChargeMs.value = Math.min(FOCUS_PULSE_MS, focusChargeMs.value + dt)
  }

  function acceptLevelUp(skillChoiceId?: string): boolean {
    const event = levelUpEvent.value
    if (!event) return false

    if (event.skillChoices?.length) {
      const offered = event.skillChoices.some(choice => choice.id === skillChoiceId)
      const available = skillChoiceId && isSkillChoiceAvailable(skillChoiceId, player.ownedSkillChoiceIds)
      if (!skillChoiceId || !offered || !available) return false

      player.ownedSkillChoiceIds.push(skillChoiceId)
      rebuildPlayerSkills()
    }

    if (isLevelUpTutorialActive.value) levelUpTutorialComplete.value = true

    showNextLevelUp()
    return true
  }

  /** Presents dialogs FIFO so each tree choice sees choices accepted by earlier dialogs. */
  function showNextLevelUp() {
    const next = queuedLevelUps.shift()
    if (!next) {
      levelUpEvent.value = undefined
      return
    }

    const {grantsSkillChoice, ...event} = next
    levelUpEvent.value = {
      ...event,
      skillChoices: grantsSkillChoice ? skillTreeChoices : undefined,
    }
  }

  function queueLevelUp(event: QueuedLevelUp) {
    queuedLevelUps.push(event)
    if (!levelUpEvent.value) showNextLevelUp()
  }

  function gainXp(amount: number) {
    player.xp += amount
    xpGainEvent.value = {amount, id: ++xpGainCounter}

    const required = xpToNextPlayerLevel.get(player.level)
    if (player.level < MAX_PLAYER_LEVEL && required !== undefined && player.xp >= required) {
      player.xp -= required
      player.level += 1

      const oldMaxHp = player.combatant.maxHp
      // Always defined: maxHpForPlayerLevel covers every level 1-30, and MAX_PLAYER_LEVEL caps player.level at 30.
      const newMaxHp = maxHpForPlayerLevel.get(player.level)!
      player.combatant.maxHp = newMaxHp
      // Grants the same HP the max just gained, rather than a full heal — a near-death level-up doesn't erase the danger.
      playerState.value.hp += newMaxHp - oldMaxHp

      const oldPower = player.power
      const newPower = totalPlayerPower(player.level)
      player.power = newPower

      const weaponUpgrade = weaponUpgradeForLevel(player.level)
      if (weaponUpgrade || newPower !== oldPower) {
        refreshWeaponsAndSkills();
      }

      queueLevelUp({
        level: player.level,
        oldMaxHp,
        newMaxHp,
        oldPower,
        newPower,
        weaponUpgrades: weaponUpgrade ? player.weapons : undefined,
        grantsSkillChoice: skillChoiceLevels.has(player.level),
        id: ++levelUpCounter,
      })
    }
  }

  function equipWeapon(weapon: Weapon) {
    player.equippedWeaponSlot = weapon.slot!
    applyEquippedWeapon(weapon)
  }

  function applyEquippedWeapon(weapon: Weapon) {
    player.combatant.weapon = weapon

    const basicAttack = playerState.value.skills.find(skill => skill.id === 'basic-attack')
    if (basicAttack) {
      Object.assign(basicAttack, basicAttackSkill(weapon), {
        remaining: weapon.cooldown,
        pendingHits: []
      })
    }
  }

  /** Rebuilds learned skills while preserving existing cooldowns and already-fired pending effects. */
  function rebuildPlayerSkills() {
    const definitions = skillsForPlayer(player)
    const liveById = new Map(playerState.value.skills.map(skill => [skill.id, skill]))
    const basicAttack = liveById.get('basic-attack')!

    player.combatant.skills = definitions
    playerState.value.skills = [
      basicAttack,
      ...definitions.map(definition => {
        const live = liveById.get(definition.id)
        if (!live) return {...definition, remaining: 0, pendingHits: []}
        return {
          ...definition,
          remaining: Math.min(live.remaining, definition.cooldown),
          pendingHits: live.pendingHits,
        }
      }),
    ]
    // A learned upgrade can change the focused skill's cooldown, so begin a clean charge.
    resetFocusCharge()
  }

  function createSnapshot(): GameSnapshot {
    return {
      activeArea: activeArea.value,
      activeLevel: activeLevel.value,
      activeWeapon: player.equippedWeaponSlot,
      level: player.level,
      xp: player.xp,
      skills: [...player.ownedSkillChoiceIds],
      focusedSkill: focusedSkillId.value,
      highestUnlockedLevel: highestUnlockedLevel.value,
      badges: [...earnedBadgeIds.value],
      tutorialComplete: tutorialComplete.value,
      levelUpTutorialComplete: levelUpTutorialComplete.value,
    }
  }

  function clearTransientState() {
    queuedLevelUps.splice(0)
    levelUpEvent.value = undefined
    xpGainEvent.value = undefined
    areaReclaimedEvent.value = undefined
    areaReclaimedRemainingMs = 0
    combatHeldForCutscene.value = false
    pendingPlayerAttacks.value = []
    pendingPlayerBuffs.value = []
    pendingPlayerAgiBuffs.value = []
    pendingPlayerHeals.value = []
    pendingBleedAttacks.value = []
    pendingHotHeals.value = []
  }

  function reset() {
    Object.assign(player, createNewPlayer())
    activeArea.value = 'Field'
    activeLevel.value = 0
    highestUnlockedLevel.value = 1
    tutorialComplete.value = false
    levelUpTutorialComplete.value = false
    earnedBadgeIds.value = []
    resetFocus()
    clearTransientState()

    startFight(trainingDummy)
  }

  /** Leaves the one-off tutorial encounter and starts normal progression at Field 1. */
  function completeTutorial() {
    if (tutorialComplete.value) return

    tutorialComplete.value = true
    activeArea.value = 'Field'
    activeLevel.value = 1
    startFight(fieldMonsters[0]!)
  }

  function restoreSnapshot(candidate: unknown): boolean {
    if (!candidate || typeof candidate !== 'object') return false

    const save = candidate as Partial<GameSnapshot>
    if (!Number.isInteger(save.level) || save.level! < 1 || save.level! > MAX_PLAYER_LEVEL) return false
    if (!Number.isInteger(save.xp) || save.xp! < 0) return false

    clearTransientState()

    const level = save.level!
    player.level = level
    // XP can legitimately exceed the next threshold because progression intentionally
    // performs at most one level-up per kill. Preserve that rolling value exactly.
    player.xp = save.xp!
    player.combatant.maxHp = maxHpForPlayerLevel.get(level)!

    const savedBadges = Array.isArray(save.badges) ? save.badges : []
    earnedBadgeIds.value = [...new Set(savedBadges.filter(badge => typeof badge === 'string' && isAreaName(badge)))]

    player.power = totalPlayerPower(level)
    player.weapons = resolveWeaponsForLevel(level, player.power)

    const savedWeapon = save.activeWeapon
    const weaponSlot: WeaponSlot = savedWeapon === 'dagger' || savedWeapon === 'axe' || savedWeapon === 'sword'
      ? savedWeapon
      : 'sword'
    player.equippedWeaponSlot = weaponSlot

    const savedSkills = Array.isArray(save.skills) ? save.skills : []
    player.ownedSkillChoiceIds = [...new Set(savedSkills.filter(skill => typeof skill === 'string' && isSkillChoiceId(skill)))]
    player.combatant.skills = skillsForPlayer(player)
    player.combatant.weapon = player.weapons.find(weapon => weapon.slot === weaponSlot)!
    playerState.value = createCombatantState(player.combatant)

    const savedFocusedSkill = typeof save.focusedSkill === 'string' ? save.focusedSkill : 'basic-attack'
    resetFocus(playerState.value.skills.some(skill => skill.id === savedFocusedSkill)
      ? savedFocusedSkill
      : 'basic-attack')

    // A save can happen while a skill-choice level-up is awaiting acceptance. Skills are
    // the committed state, so recreate any earned-but-unaccepted choices after loading.
    const earnedSkillChoiceLevels = [...skillChoiceLevels].filter(choiceLevel => choiceLevel <= level)
    for (const choiceLevel of earnedSkillChoiceLevels.slice(player.ownedSkillChoiceIds.length)) {
      queueLevelUp({
        level: choiceLevel,
        oldMaxHp: maxHpForPlayerLevel.get(choiceLevel - 1)!,
        newMaxHp: maxHpForPlayerLevel.get(choiceLevel)!,
        oldPower: powerForPlayerLevel.get(choiceLevel - 1)!,
        newPower: powerForPlayerLevel.get(choiceLevel)!,
        grantsSkillChoice: true,
        id: ++levelUpCounter,
      })
    }

    highestUnlockedLevel.value = Number.isInteger(save.highestUnlockedLevel)
      ? Math.min(MAX_AREA_LEVEL, Math.max(1, save.highestUnlockedLevel!))
      : 1

    tutorialComplete.value = save.tutorialComplete !== false
    // Only a fresh new game can see the level-up tutorial: any save already past level 1
    // may have missed it, and its level-up UI isn't guaranteed to be in the state it expects.
    levelUpTutorialComplete.value = save.levelUpTutorialComplete === true || level > 1

    if (!tutorialComplete.value) {
      activeArea.value = 'Field'
      activeLevel.value = 0
      startFight(trainingDummy)
      return true
    }

    activeArea.value = 'Field'
    activeLevel.value = 1
    if (typeof save.activeArea === 'string' && isAreaName(save.activeArea)) {
      const requestedLevel = Number.isInteger(save.activeLevel) && isLevelInArea(save.activeArea, save.activeLevel!)
        ? save.activeLevel!
        : levelsForArea(save.activeArea).at(-1)!
      activeLevel.value = Math.min(requestedLevel, highestUnlockedLevel.value)
      activeArea.value = areaForLevel(activeLevel.value)
    }

    // AreaTabs resolves the selected 1-40 encounter when the game view mounts
    // or reacts to this level change. Level 0 is the only encounter owned
    // directly by the tutorial lifecycle above.

    return true
  }

  function start() {
    if (intervalId === undefined) intervalId = setInterval(() => tick(TICK_MS), TICK_MS)
  }

  function stop() {
    clearInterval(intervalId)
    intervalId = undefined
  }

  function tick(dt: number) {
    advanceAreaReclaimedBanner(dt)

    if (battlePhase.value !== 'fighting') {
      advanceBattleIntermission(dt)
      return
    }

    // Let the reclaimed banner finish while the new encounter waits for its story scene.
    if (combatHeldForCutscene.value) return

    const tickPlayerState = playerState.value
    const tickFoeState = monsterState.value
    if (!tickFoeState) return

    updateFocus(dt)

    const outcome = advanceFight(tickPlayerState, tickFoeState, dt, {
      onBleedTick: side => pendingBleedAttacks.value.push({side, id: ++bleedAttackCounter}),
      onHealTick: side => pendingHotHeals.value.push({side, id: ++hotHealCounter}),
      onPlayerSkillFired,
      onPlayerReactiveEffect: onPlayerReactiveSkillEffect,
    })

    if (outcome === 'monster-defeated') {
      gainXp(monster.value!.xp)
      unlockNextLevelIfFrontierCleared()
      const areaReclaimed = awardBadgeIfBossCleared()
      if (areaReclaimed) {
        areaReclaimedEvent.value = {area: activeArea.value, id: ++areaReclaimedCounter}
        areaReclaimedRemainingMs = AREA_RECLAIMED_BANNER_MS
      }
      battlePhase.value = 'victory'
      battlePhaseRemainingMs = VICTORY_PAUSE_MS
    } else if (outcome === 'player-defeated') {
      battlePhase.value = 'defeat'
      battlePhaseRemainingMs = DEFEAT_PAUSE_MS
    }
  }

  function advanceAreaReclaimedBanner(dt: number) {
    if (!areaReclaimedEvent.value) return

    areaReclaimedRemainingMs -= dt
    if (areaReclaimedRemainingMs <= 0) {
      areaReclaimedEvent.value = undefined
      areaReclaimedRemainingMs = 0
    }
  }

  function advanceBattleIntermission(dt: number) {
    battlePhaseRemainingMs -= dt
    if (battlePhaseRemainingMs > 0) return

    if (battlePhase.value === 'victory') {
      // A win carries the player's HP, statuses, and cooldowns into the next encounter.
      respawnMonster(monster.value!)
      battlePhase.value = 'spawning'
      battlePhaseRemainingMs = RESPAWN_PAUSE_MS
      return
    }

    if (battlePhase.value === 'defeat') {
      // A loss resets both combatants, but the fresh enemy gets the same entrance beat.
      playerState.value = createCombatantState(player.combatant)
      resetFocusCharge()
      respawnMonster(monster.value!)
      battlePhase.value = 'spawning'
      battlePhaseRemainingMs = RESPAWN_PAUSE_MS
      return
    }

    battlePhase.value = 'fighting'
    battlePhaseRemainingMs = 0
  }

  function onPlayerSkillFired(skill: SkillState) {
    const hits = skill.effects.filter(effect => effect.type === 'dmg').length
    if (hits > 0) pendingPlayerAttacks.value.push({
      skillId: skill.id,
      hits,
      id: ++playerAttackCounter
    })

    const defPoints = skill.effects.filter(effect => effect.type === 'def').reduce((sum, effect) => sum + effect.amount, 0)
    if (defPoints > 0) pendingPlayerBuffs.value.push({
      skillId: skill.id,
      points: defPoints,
      id: ++playerBuffCounter
    })

    const agiPoints = skill.effects.filter(effect => effect.type === 'agi').reduce((sum, effect) => sum + effect.charges, 0)
    if (agiPoints > 0) pendingPlayerAgiBuffs.value.push({
      skillId: skill.id,
      points: agiPoints,
      id: ++playerAgiBuffCounter
    })

    const healPoints = skill.effects
      .reduce((sum, effect) => effect.type === 'heal' && !effect.duration
        ? sum + healIconCountFor(effect.amount)
        : sum, 0)
    if (healPoints > 0) pendingPlayerHeals.value.push({
      skillId: skill.id,
      points: healPoints,
      id: ++playerHealCounter
    })
  }

  function onPlayerReactiveSkillEffect(skill: SkillState, type: 'dmg' | 'heal', amount: number) {
    if (type === 'dmg') {
      pendingPlayerAttacks.value.push({skillId: skill.id, hits: 1, id: ++playerAttackCounter})
    } else {
      pendingPlayerHeals.value.push({
        skillId: skill.id,
        points: healIconCountFor(amount),
        id: ++playerHealCounter,
      })
    }
  }

  return {
    player,
    playerState,
    monster,
    monsterState,
    battlePhase,
    activeArea,
    activeLevel,
    highestUnlockedLevel,
    earnedBadgeIds,
    tutorialComplete,
    isTutorialActive,
    levelUpTutorialComplete,
    isLevelUpTutorialActive,
    isLevelUnlocked,
    isAreaUnlocked,
    hasBadge,
    focusedSkillId,
    focusChargeMs,
    focusPulseReady,
    xpGainEvent,
    areaReclaimedEvent,
    combatHeldForCutscene,
    levelUpEvent,
    pendingPlayerAttacks,
    pendingPlayerBuffs,
    pendingPlayerAgiBuffs,
    pendingPlayerHeals,
    pendingBleedAttacks,
    pendingHotHeals,
    startFight,
    holdCombatForCutscene,
    releaseCombatFromCutscene,
    equipWeapon,
    useFocus,
    acceptLevelUp,
    createSnapshot,
    restoreSnapshot,
    completeTutorial,
    reset,
    start,
    stop,
  }
})
