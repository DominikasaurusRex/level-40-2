import { ref } from 'vue'

export type SoundEffect =
  | 'normal-click'
  | 'hardware-click'
  | 'close'
  | 'error-click'
  | 'focus'
  | 'level-up'
  | 'boss'
  | 'outro'
  | 'badge-drop'
  | 'reclaimed'

const SOUND_VOLUME_KEY = 'level-40.sound-volume'
const DEFAULT_VOLUME = 60

const soundFiles: Record<SoundEffect, string> = {
  'normal-click': '/audio/ui/normal-click.WAV',
  'hardware-click': '/audio/ui/hardware-click.WAV',
  close: '/audio/ui/close.WAV',
  'error-click': '/audio/ui/error-click.WAV',
  focus: '/audio/ui/focuse.WAV',
  'level-up': '/audio/ui/level-up.wav',
  boss: '/audio/ui/Boss.wav',
  outro: '/audio/ui/outro.wav',
  'badge-drop': '/audio/ui/badge-drop.mp3',
  reclaimed: '/audio/ui/reclaimed.mp3',
}

const soundVolumeMultipliers: Partial<Record<SoundEffect, number>> = {
  boss: 0.4,
}

const soundPools = new Map<SoundEffect, HTMLAudioElement[]>()

function createAudio(effect: SoundEffect): HTMLAudioElement {
  const audio = new Audio(soundFiles[effect])
  audio.preload = 'auto'
  audio.load()
  return audio
}

export function preloadSounds() {
  if (typeof Audio === 'undefined') return

  for (const effect of Object.keys(soundFiles) as SoundEffect[]) {
    if (!soundPools.has(effect)) soundPools.set(effect, [createAudio(effect)])
  }
}

function storedVolume(): number {
  if (typeof localStorage === 'undefined') return DEFAULT_VOLUME

  try {
    const stored = localStorage.getItem(SOUND_VOLUME_KEY)
    if (stored === null) return DEFAULT_VOLUME
    const value = Number(stored)
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

export const soundVolume = ref(storedVolume())

export function setSoundVolume(volume: number) {
  soundVolume.value = Math.min(100, Math.max(0, volume))

  try {
    localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume.value))
  } catch {
    // Sound still works for this session if browser storage is unavailable.
  }
}

export function playSound(effect: SoundEffect) {
  if (typeof Audio === 'undefined' || soundVolume.value === 0) return

  let pool = soundPools.get(effect)
  if (!pool) {
    pool = [createAudio(effect)]
    soundPools.set(effect, pool)
  }

  let audio = pool.find(player => player.paused || player.ended)
  if (!audio) {
    audio = createAudio(effect)
    pool.push(audio)
  }

  audio.currentTime = 0
  audio.volume = (soundVolume.value / 100) * (soundVolumeMultipliers[effect] ?? 1)
  void audio.play().catch(() => {
    // Browsers may reject playback before the first user interaction.
  })
}
