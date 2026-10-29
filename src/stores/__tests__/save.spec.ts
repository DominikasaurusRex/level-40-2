import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { SAVE_FORMAT_VERSION, SAVE_STORAGE_KEY, useSaveStore, type StoredGame } from '@/stores/save'
import { useGameStore } from '@/stores/game'

function memoryStorage(initialValue?: StoredGame): Storage {
  const values = new Map<string, string>()
  if (initialValue) values.set(SAVE_STORAGE_KEY, JSON.stringify(initialValue))

  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(key) },
    setItem: (key, value) => { values.set(key, value) },
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('save store', () => {
  it('restores persistent progress and writes it back as stable IDs', () => {
    const storage = memoryStorage({
      version: SAVE_FORMAT_VERSION,
      savedAt: '2026-09-05T12:00:00.000Z',
      activeArea: 'Cave',
      activeLevel: 14,
      activeWeapon: 'axe',
      level: 13,
      xp: 20_000,
      skills: ['strike', 'strike-power'],
      focusedSkill: 'strike',
      highestUnlockedLevel: 14,
      badges: ['Field'],
    })
    vi.stubGlobal('localStorage', storage)
    setActivePinia(createPinia())

    const game = useGameStore()
    const saves = useSaveStore()
    expect(saves.load()).toBe(true)

    expect(game.activeArea).toBe('Cave')
    expect(game.activeLevel).toBe(14)
    expect(game.tutorialComplete).toBe(true)
    expect(game.highestUnlockedLevel).toBe(14)
    expect(game.player.level).toBe(13)
    expect(game.player.xp).toBe(20_000)
    expect(game.player.combatant.maxHp).toBe(maxHpForPlayerLevel.get(13))
    expect(game.player.equippedWeaponSlot).toBe('axe')
    expect(game.player.combatant.weapon.name).toBe('Good Axe')
    expect(game.player.ownedSkillChoiceIds).toEqual(['strike', 'strike-power'])
    expect(game.earnedBadgeIds).toEqual(['Field'])
    expect(game.focusedSkillId).toBe('strike')
    expect(game.playerState.skills.map(skill => skill.id)).toEqual(['basic-attack', 'strike'])
    expect(game.levelUpEvent?.level).toBe(5)
    expect(saves.secondsSinceSave).toBeGreaterThanOrEqual(0)

    storage.removeItem(SAVE_STORAGE_KEY)
    vi.useFakeTimers()
    saves.start()
    vi.advanceTimersByTime(60_000)

    expect(JSON.parse(storage.getItem(SAVE_STORAGE_KEY)!)).toMatchObject({
      version: SAVE_FORMAT_VERSION,
      activeArea: 'Cave',
      activeLevel: 14,
      activeWeapon: 'axe',
      level: 13,
      xp: 20_000,
      skills: ['strike', 'strike-power'],
      focusedSkill: 'strike',
      highestUnlockedLevel: 14,
      badges: ['Field'],
    })

    saves.stop()
  })

  it('imports a Base64 .sav file and can reset back to a persisted new game', async () => {
    const storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    setActivePinia(createPinia())

    const game = useGameStore()
    const saves = useSaveStore()
    const imported: StoredGame = {
      version: SAVE_FORMAT_VERSION,
      savedAt: '2026-09-05T12:00:00.000Z',
      activeArea: 'Forest',
      activeLevel: 8,
      activeWeapon: 'dagger',
      level: 6,
      xp: 700,
      skills: ['guard'],
      focusedSkill: 'basic-attack',
      highestUnlockedLevel: 8,
      badges: ['Field'],
    }
    const file = { text: async () => btoa(JSON.stringify(imported)) } as File

    expect(await saves.importFile(file)).toBe(true)
    expect(game.activeArea).toBe('Forest')
    expect(game.player.level).toBe(6)
    expect(game.player.equippedWeaponSlot).toBe('dagger')
    expect(game.earnedBadgeIds).toEqual(['Field'])
    expect(JSON.parse(storage.getItem(SAVE_STORAGE_KEY)!)).toMatchObject({
      activeArea: 'Forest',
      level: 6,
      activeWeapon: 'dagger',
    })

    expect(saves.reset()).toBe(true)
    expect(game.activeArea).toBe('Field')
    expect(game.activeLevel).toBe(0)
    expect(game.isTutorialActive).toBe(true)
    expect(game.highestUnlockedLevel).toBe(1)
    expect(game.player.level).toBe(1)
    expect(game.player.xp).toBe(0)
    expect(game.player.equippedWeaponSlot).toBe('sword')
    expect(game.player.ownedSkillChoiceIds).toEqual([])
    expect(game.earnedBadgeIds).toEqual([])
    expect(game.focusedSkillId).toBe('basic-attack')
    expect(JSON.parse(storage.getItem(SAVE_STORAGE_KEY)!)).toMatchObject({
      activeArea: 'Field',
      activeLevel: 0,
      activeWeapon: 'sword',
      level: 1,
      xp: 0,
      skills: [],
      focusedSkill: 'basic-attack',
      highestUnlockedLevel: 1,
      badges: [],
      tutorialComplete: false,
    })
  })

  it('restores an unfinished tutorial without making level 0 normally unlockable', () => {
    const storage = memoryStorage({
      version: SAVE_FORMAT_VERSION,
      savedAt: '2026-09-05T12:00:00.000Z',
      activeArea: 'Field',
      activeLevel: 0,
      activeWeapon: 'sword',
      level: 1,
      xp: 0,
      skills: [],
      focusedSkill: 'basic-attack',
      highestUnlockedLevel: 1,
      badges: [],
      tutorialComplete: false,
    })
    vi.stubGlobal('localStorage', storage)
    setActivePinia(createPinia())

    const game = useGameStore()
    const saves = useSaveStore()

    expect(saves.load()).toBe(true)
    expect(game.isTutorialActive).toBe(true)
    expect(game.activeLevel).toBe(0)
    expect(game.isLevelUnlocked(0)).toBe(false)
    expect(game.monster?.combatant.name).toBe('Training Dummy')
  })
})
