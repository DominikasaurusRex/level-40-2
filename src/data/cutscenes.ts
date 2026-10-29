export type CutsceneId = 'intro' | 'wolf' | 'dragon' | 'credits'

export interface Cutscene {
  id: CutsceneId
  background: string
  portrait: string
  speaker: string
  lines: string[]
}

export const introCutscene: Cutscene = {
  id: 'intro',
  background: '/cutscene/gate_bg.webp',
  portrait: '/cutscene/guard.png',
  speaker: 'Gatekeeper',
  lines: [
    'Ah. You’re the one they sent. Good, good... I was expecting someone taller.',
    'Monsters. Outside. Getting to be a bit much, if I’m honest.',
    'Forty-ish of them, give or take. Somebody’s got to sort it out.',
    'You seemed sturdy enough. And cheaper than hiring forty separate somebodies.',
    'Oh — you’ll want a weapon. There’s a sword, obviously, everyone loves a sword. But there’s also a dagger, and a rather large axe, if that’s more your style.',
    'Try them all. Don’t just default to the sword because it’s first in line.',
    'One more thing. Try not to become more of a problem than the monsters. That would be embarrassing for both of us.',
    'Go on, then. They’re not going to hit themselves. Well — some of them might.',
  ],
}

export const wolfCutscene: Cutscene = {
  id: 'wolf',
  background: '/cutscene/gate_bg.webp',
  portrait: '/cutscene/guard.png',
  speaker: 'Gatekeeper',
  lines: [
    'Oh. You actually beat the wolf.',
    'You’d be surprised how many would-be heroes don’t even get that far.',
    'Don’t let it go to your head, though. The real challenge doesn’t start until after the cave.',
  ],
}

export const dragonCutscene: Cutscene = {
  id: 'dragon',
  background: '/cutscene/gate_bg.webp',
  portrait: '/cutscene/guard.png',
  speaker: 'Gatekeeper',
  lines: [
    '...Huh. Nobody’s ever beaten the dragon before.',
    'I’ll be honest, I underestimated you. That’s on me.',
    'So. Guess that’s that, then. Head home, hang up the sword — or whichever one you actually ended up using.',
    '...What do you mean there’s more?',
    'You killed a dragon. A literal dragon. What’s left?',
    'Yeah sure... don’t let me stop you from getting yourself killed.',
  ],
}

export const creditsCutscene: Cutscene = {
  id: 'credits',
  background: '/cutscene/gate_bg.webp',
  portrait: '/cutscene/guard.png',
  speaker: 'Gatekeeper',
  lines: [
    '...You’re back.',
    'Did you seriously kill a god? That one wasn’t even bothering anyone. Honestly, you could have stopped around the dungeon.',
    'I was joking about the other forty somebodies, by the way. You know we’ve been raising an army this whole time, right?',
    'Not that they’d have done much, waste of time in hindsight.',
    'I mean — you did it. Don’t let me take your glory or anything, but that was a lot of paperwork.',
    'You really are something else.',
    'Gate’s always open for you. But before you go, let me show you this.',
  ],
}
