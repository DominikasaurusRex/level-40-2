import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useGameStore, type GameSnapshot } from '@/stores/game'

const AUTOSAVE_MS = 60_000
const COUNTER_TICK_MS = 1_000
export const SAVE_STORAGE_KEY = 'level-40.save'
export const SAVE_FORMAT_VERSION = 1

export interface StoredGame extends GameSnapshot {
  version: typeof SAVE_FORMAT_VERSION
  savedAt: string
}

function browserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function readStoredGame(storage: Storage | undefined = browserStorage()): unknown {
  if (!storage) return undefined

  try {
    const serialized = storage.getItem(SAVE_STORAGE_KEY)
    return serialized ? JSON.parse(serialized) : undefined
  } catch {
    return undefined
  }
}

function writeStoredGame(save: StoredGame, storage: Storage | undefined = browserStorage()): boolean {
  if (!storage) return false

  try {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save))
    return true
  } catch {
    return false
  }
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = atob(value.trim())
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export const useSaveStore = defineStore('save', () => {
  const game = useGameStore()
  const lastSavedAt = ref<Date>()
  const now = ref(Date.now())
  const saveError = ref<string>()
  const secondsSinceSave = computed(() => lastSavedAt.value
    ? Math.max(0, Math.floor((now.value - lastSavedAt.value.getTime()) / 1_000))
    : undefined,
  )

  let counterIntervalId: ReturnType<typeof setInterval> | undefined
  let nextAutosaveAt = 0

  function load(): boolean {
    const candidate = readStoredGame()
    if (!candidate || typeof candidate !== 'object') return false

    const save = candidate as Partial<StoredGame>
    if (save.version !== SAVE_FORMAT_VERSION || !game.restoreSnapshot(save)) {
      saveError.value = 'The save data is invalid or incompatible.'
      return false
    }

    const savedAt = typeof save.savedAt === 'string' ? new Date(save.savedAt) : undefined
    lastSavedAt.value = savedAt && Number.isFinite(savedAt.getTime()) ? savedAt : undefined
    now.value = Date.now()
    saveError.value = undefined
    return true
  }

  function saveNow(): boolean {
    const savedAt = new Date()
    const save: StoredGame = {
      version: SAVE_FORMAT_VERSION,
      savedAt: savedAt.toISOString(),
      ...game.createSnapshot(),
    }

    if (!writeStoredGame(save)) {
      saveError.value = 'The game could not be saved.'
      return false
    }

    lastSavedAt.value = savedAt
    now.value = savedAt.getTime()
    nextAutosaveAt = now.value + AUTOSAVE_MS
    saveError.value = undefined
    return true
  }

  function download(): boolean {
    if (!saveNow()) return false

    const storage = browserStorage()
    const serialized = storage?.getItem(SAVE_STORAGE_KEY)
    if (!serialized || typeof document === 'undefined') {
      saveError.value = 'The save file could not be created.'
      return false
    }

    try {
      const blob = new Blob([encodeBase64(serialized)], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `level-40-${new Date().toISOString().slice(0, 10)}.sav`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      return true
    } catch {
      saveError.value = 'The save file could not be created.'
      return false
    }
  }

  function rejectImportedFile(): false {
    saveError.value = 'The selected save file is invalid or incompatible.'
    return false
  }

  async function importFile(file: File): Promise<boolean> {
    let candidate: unknown

    try {
      candidate = JSON.parse(decodeBase64(await file.text())) as unknown
    } catch {
      return rejectImportedFile()
    }

    if (!candidate || typeof candidate !== 'object') return rejectImportedFile()

    const save = candidate as Partial<StoredGame>
    if (save.version !== SAVE_FORMAT_VERSION) return rejectImportedFile()
    if (!game.restoreSnapshot(save)) return rejectImportedFile()

    return saveNow()
  }

  function reset(): boolean {
    game.reset()
    return saveNow()
  }

  function updateCounterAndAutosave() {
    now.value = Date.now()
    if (now.value < nextAutosaveAt) return

    saveNow()
  }

  function start() {
    if (counterIntervalId !== undefined) return

    now.value = Date.now()
    nextAutosaveAt = now.value + AUTOSAVE_MS
    counterIntervalId = setInterval(updateCounterAndAutosave, COUNTER_TICK_MS)
    if (typeof window !== 'undefined') window.addEventListener('pagehide', saveNow)
  }

  function stop() {
    if (counterIntervalId === undefined) return

    clearInterval(counterIntervalId)
    counterIntervalId = undefined
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', saveNow)
    saveNow()
  }

  return {
    lastSavedAt,
    secondsSinceSave,
    saveError,
    load,
    saveNow,
    download,
    importFile,
    reset,
    start,
    stop,
  }
})
