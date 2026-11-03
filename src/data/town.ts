/**
 * The Town's places. Every place works the same way: its own background, an NPC to chat with
 * (chats live in `chats.ts`), and one action.
 *
 * NPC names and art are placeholders until they are decided.
 */
export enum PlaceId {
  Inn = 'inn',
  Barracks = 'barracks',
  Smithy = 'smithy',
  Library = 'library',
  QuestBoard = 'quest-board',
  Bar = 'bar',
  Gate = 'gate',
}

/** The stage whose boss ends in the first "Fin?". Reaching the stage after it means "after Fin?". */
export const FIRST_ENDING_STAGE = 25

/** The facts a background can depend on. */
export interface BackgroundContext {
  /** Furthest stage the player has reached. */
  furthestStage: number
  /** Whether this place has been rebuilt. */
  rebuilt: boolean
}

/** Every condition is optional; a background matches when all of the ones it sets hold. */
export interface BackgroundConditions {
  /** Matches once the furthest stage reached is at least this. */
  fromStage?: number
  rebuilt?: boolean
}

export interface PlaceBackground {
  when?: BackgroundConditions
  image: string
}

export interface TownPlace {
  id: PlaceId
  name: string
  /** Building colour on the Town map; also the scene backdrop when no background matches. */
  color: string
  /**
   * Checked in order; the **last** matching background is shown, so list them from general to
   * specific. For example: broken (`rebuilt: false`), repaired (`rebuilt: true`), then repaired
   * after "Fin?" (`rebuilt: true, fromStage: FIRST_ENDING_STAGE + 1`).
   */
  backgrounds: PlaceBackground[]
  /** Standing from the start, so it never needs rebuilding (the Inn, and the walls' Gate). */
  startsBuilt?: boolean
  npc: {
    name: string
    portrait?: string
  }
  actionLabel: string
}

export const townPlaces: TownPlace[] = [
  {
    id: PlaceId.Inn,
    name: 'Inn',
    color: '#c9803c',
    backgrounds: [],
    startsBuilt: true,
    npc: { name: 'Innkeeper' },
    actionLabel: 'Equipment',
  },
  {
    id: PlaceId.Barracks,
    name: 'Barracks',
    color: '#b8453f',
    backgrounds: [],
    npc: { name: 'Trainer' },
    actionLabel: 'Skill Board',
  },
  {
    id: PlaceId.Smithy,
    name: 'Smithy',
    color: '#7d8590',
    backgrounds: [],
    npc: { name: 'Smith' },
    actionLabel: 'Weapons',
  },
  {
    id: PlaceId.Library,
    name: 'Library',
    color: '#6a4fb0',
    backgrounds: [],
    npc: { name: 'Librarian' },
    actionLabel: 'Monster Manual',
  },
  {
    id: PlaceId.QuestBoard,
    name: 'Quest Board',
    color: '#3f9a5a',
    backgrounds: [],
    npc: { name: 'Clerk' },
    actionLabel: 'Quests',
  },
  {
    id: PlaceId.Bar,
    name: 'Bar',
    color: '#d4b13f',
    backgrounds: [],
    npc: { name: 'Barkeep' },
    actionLabel: 'Exchange',
  },
  {
    id: PlaceId.Gate,
    name: 'Gate',
    color: '#3a8fb5',
    backgrounds: [
      { image: '/cutscene/gate_bg.webp' },
    ],
    startsBuilt: true,
    npc: { name: 'Gatekeeper', portrait: '/cutscene/guard.png' },
    actionLabel: 'Embark',
  },
]

export function placeById(id: PlaceId): TownPlace {
  return townPlaces.find(place => place.id === id)!
}

/** The places already standing on a new game. */
export function startingRebuiltPlaceIds(): PlaceId[] {
  return townPlaces.filter(place => place.startsBuilt).map(place => place.id)
}

export function backgroundMatches(background: PlaceBackground, context: BackgroundContext): boolean {
  const when = background.when
  if (!when) return true
  if (when.fromStage !== undefined && context.furthestStage < when.fromStage) return false
  if (when.rebuilt !== undefined && context.rebuilt !== when.rebuilt) return false
  return true
}

/** The image to show, or undefined when none matches (the scene then uses the place's colour). */
export function backgroundFor(place: TownPlace, context: BackgroundContext): string | undefined {
  let image: string | undefined
  for (const background of place.backgrounds) {
    if (backgroundMatches(background, context)) image = background.image
  }
  return image
}
