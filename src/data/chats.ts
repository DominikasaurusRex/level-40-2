import type { PlaceId } from './town'

/**
 * What each place's NPC says when chatting. The chat shown is the last entry whose `fromStage`
 * the player has reached, so conversations move on with the story.
 *
 * All lines are placeholders until they are written.
 */
export interface Chat {
  /** First stage (furthest reached) at which this chat replaces the previous one. */
  fromStage: number
  lines: string[]
}

export const chats: Record<PlaceId, Chat[]> = {
  'inn': [
    { fromStage: 1, lines: ['Welcome. Pick what you take with you before you head out.'] },
  ],
  'barracks': [
    { fromStage: 1, lines: ['Bring me experience and I’ll turn it into something useful.'] },
  ],
  'smithy': [
    { fromStage: 1, lines: ['Gold and materials. That’s all I need to make you something better.'] },
  ],
  'library': [
    { fromStage: 1, lines: ['Know what you’re fighting. Read up before you go.'] },
  ],
  'quest-board': [
    { fromStage: 1, lines: ['Only what you do after signing up counts. No exceptions.'] },
  ],
  'bar': [
    { fromStage: 1, lines: ['Gold for experience, experience for gold. I don’t ask questions.'] },
  ],
  'gate': [
    {
      fromStage: 1,
      lines: [
        'So you’re the one who answered the call. Not much of a town left to welcome you, I’m afraid.',
        'Whatever came through here flattened everything but the walls. And this gate, thankfully.',
        'Bring back what you can find out there. Gold, materials, anything. We’ll rebuild with it.',
      ],
    },
    { fromStage: 6, lines: ['The cave, is it? Mind the other exit. The old road leads somewhere you don’t want to go.'] },
    { fromStage: 11, lines: ['A volcano full of ice. Of course it is. Pack for both.'] },
    { fromStage: 16, lines: ['The storms up on the mountain are getting worse. Whatever wrecked us came from up there.'] },
    { fromStage: 21, lines: ['There’s a temple at the summit. If you find the thing that did this, give it my regards.'] },
    { fromStage: 26, lines: ['You beat it. The whole town is still celebrating.', 'So why do you keep looking at the moon like that?'] },
  ],
}

export function chatFor(placeId: PlaceId, furthestStage: number): Chat {
  const placeChats = chats[placeId]
  let chat = placeChats[0]!
  for (const entry of placeChats) {
    if (entry.fromStage <= furthestStage) chat = entry
  }
  return chat
}
