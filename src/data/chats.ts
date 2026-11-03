import { PlaceId } from './town'

/**
 * What each place's NPC says when chatting. A place's chats are checked in order and the
 * **last** one whose conditions all hold is shown, so list them from general to specific.
 * A chat without conditions always matches; every place's first chat should be one.
 *
 * All lines are placeholders until they are written.
 */

/** The facts a chat can depend on. */
export interface ChatContext {
  /** Furthest stage the player has reached. */
  furthestStage: number
  /** Whether this place has been rebuilt. */
  rebuilt: boolean
  /** Whether this place has every upgrade. */
  fullyUpgraded: boolean
  /** Whether an original Level 40 save was imported at New Game. */
  originalSaveImported: boolean
  /** Whether that imported save had beaten the final boss. */
  originalFinalBossBeaten: boolean
}

/** Every condition is optional; a chat matches when all of the ones it sets hold. */
export interface ChatConditions {
  /** Matches once the furthest stage reached is at least this. */
  fromStage?: number
  rebuilt?: boolean
  fullyUpgraded?: boolean
  originalSaveImported?: boolean
  originalFinalBossBeaten?: boolean
}

export interface Chat {
  when?: ChatConditions
  lines: string[]
}

export const chats: Record<PlaceId, Chat[]> = {
  [PlaceId.Inn]: [
    { lines: ['Welcome. Pick what you take with you before you head out.'] },
  ],
  [PlaceId.Barracks]: [
    { lines: ['Bring me experience and I’ll turn it into something useful.'] },
  ],
  [PlaceId.Smithy]: [
    { lines: ['Gold and materials. That’s all I need to make you something better.'] },
  ],
  [PlaceId.Library]: [
    { lines: ['Know what you’re fighting. Read up before you go.'] },
  ],
  [PlaceId.QuestBoard]: [
    { lines: ['Only what you do after signing up counts. No exceptions.'] },
  ],
  [PlaceId.Bar]: [
    { lines: ['Gold for experience, experience for gold. I don’t ask questions.'] },
  ],
  [PlaceId.Gate]: [
    {
      lines: [
        'So you’re the one who answered the call. Not much of a town left to welcome you, I’m afraid.',
        'Whatever came through here flattened everything but the walls. And this gate, thankfully.',
        'Bring back what you can find out there. Gold, materials, anything. We’ll rebuild with it.',
      ],
    },
    { when: { fromStage: 6 }, lines: ['The cave, is it? Mind the other exit. The old road leads somewhere you don’t want to go.'] },
    { when: { fromStage: 11 }, lines: ['A volcano full of ice. Of course it is. Pack for both.'] },
    { when: { fromStage: 16 }, lines: ['The storms up on the mountain are getting worse. Whatever wrecked us came from up there.'] },
    { when: { fromStage: 21 }, lines: ['There’s a temple at the summit. If you find the thing that did this, give it my regards.'] },
    { when: { fromStage: 26 }, lines: ['You beat it. The whole town is still celebrating.', 'So why do you keep looking at the moon like that?'] },
  ],
}

export function chatMatches(chat: Chat, context: ChatContext): boolean {
  const when = chat.when
  if (!when) return true
  if (when.fromStage !== undefined && context.furthestStage < when.fromStage) return false
  if (when.rebuilt !== undefined && context.rebuilt !== when.rebuilt) return false
  if (when.fullyUpgraded !== undefined && context.fullyUpgraded !== when.fullyUpgraded) return false
  if (when.originalSaveImported !== undefined && context.originalSaveImported !== when.originalSaveImported) return false
  if (when.originalFinalBossBeaten !== undefined && context.originalFinalBossBeaten !== when.originalFinalBossBeaten) return false
  return true
}

export function chatFor(placeId: PlaceId, context: ChatContext): Chat {
  const placeChats = chats[placeId]
  let chat = placeChats[0]!
  for (const entry of placeChats) {
    if (chatMatches(entry, context)) chat = entry
  }
  return chat
}
