/**
 * The Town's places. Every place works the same way: its own background, an NPC to chat with
 * (chats live in `chats.ts`), and one action.
 *
 * NPC names and art are placeholders until they are decided.
 */
export type PlaceId = 'inn' | 'barracks' | 'smithy' | 'library' | 'quest-board' | 'bar' | 'gate'

export interface TownPlace {
  id: PlaceId
  name: string
  /** Building colour on the Town map; also the scene backdrop while there is no background art. */
  color: string
  background?: string
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
    id: 'inn',
    name: 'Inn',
    color: '#c9803c',
    startsBuilt: true,
    npc: { name: 'Innkeeper' },
    actionLabel: 'Equipment',
  },
  {
    id: 'barracks',
    name: 'Barracks',
    color: '#b8453f',
    npc: { name: 'Trainer' },
    actionLabel: 'Skill Board',
  },
  {
    id: 'smithy',
    name: 'Smithy',
    color: '#7d8590',
    npc: { name: 'Smith' },
    actionLabel: 'Weapons',
  },
  {
    id: 'library',
    name: 'Library',
    color: '#6a4fb0',
    npc: { name: 'Librarian' },
    actionLabel: 'Monster Manual',
  },
  {
    id: 'quest-board',
    name: 'Quest Board',
    color: '#3f9a5a',
    npc: { name: 'Clerk' },
    actionLabel: 'Quests',
  },
  {
    id: 'bar',
    name: 'Bar',
    color: '#d4b13f',
    npc: { name: 'Barkeep' },
    actionLabel: 'Exchange',
  },
  {
    id: 'gate',
    name: 'Gate',
    color: '#3a8fb5',
    background: '/cutscene/gate_bg.webp',
    startsBuilt: true,
    npc: { name: 'Gatekeeper', portrait: '/cutscene/guard.png' },
    actionLabel: 'Embark',
  },
]

export function placeById(id: PlaceId): TownPlace {
  return townPlaces.find(place => place.id === id)!
}
