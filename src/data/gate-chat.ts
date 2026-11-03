/**
 * What the Gatekeeper says when chatting at the Gate. The chat shown is the last entry whose
 * `fromStage` the player has reached, so the conversation moves on with the story.
 *
 * The lines are placeholders until the story text is written.
 */
export interface GateChat {
  /** First stage (furthest reached) at which this chat replaces the previous one. */
  fromStage: number
  lines: string[]
}

export const gateScene = {
  background: '/cutscene/gate_bg.webp',
  portrait: '/cutscene/guard.png',
  speaker: 'Gatekeeper',
} as const

export const gateChats: GateChat[] = [
  {
    fromStage: 1,
    lines: [
      'So you’re the one who answered the call. Not much of a town left to welcome you, I’m afraid.',
      'Whatever came through here flattened everything but the walls. And this gate, thankfully.',
      'Bring back what you can find out there. Gold, materials, anything. We’ll rebuild with it.',
    ],
  },
  {
    fromStage: 6,
    lines: [
      'The cave, is it? Mind the other exit. The old road leads somewhere you don’t want to go.',
    ],
  },
  {
    fromStage: 11,
    lines: [
      'A volcano full of ice. Of course it is. Pack for both.',
    ],
  },
  {
    fromStage: 16,
    lines: [
      'The storms up on the mountain are getting worse. Whatever wrecked us came from up there.',
    ],
  },
  {
    fromStage: 21,
    lines: [
      'There’s a temple at the summit. If you find the thing that did this, give it my regards.',
    ],
  },
  {
    fromStage: 26,
    lines: [
      'You beat it. The whole town is still celebrating.',
      'So why do you keep looking at the moon like that?',
    ],
  },
]

export function gateChatFor(furthestStage: number): GateChat {
  let chat = gateChats[0]!
  for (const entry of gateChats) {
    if (entry.fromStage <= furthestStage) chat = entry
  }
  return chat
}
