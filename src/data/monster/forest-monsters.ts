import type { Monster } from '@/types/monster.ts'

export const forestMonsters: Monster[] = [
  {
    image: '/enemies/forest/Brambloid.webp',
    spriteScale: 0.65,
    spriteGroundOffset: 5,
    xpOrbRadius: 60,
    xpOrbOffset: 100,
    xp: 54,
    combatant: {
      name: 'Brambleling',
      maxHp: 29,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 2500 },
      skills: [
        {
          id: 'bark-shell',
          name: 'Bark Shell',
          category: 'guard',
          cooldown: 2000,
          startsReady: true,
          effects: [{ type: 'def', amount: 3 }],
        },
      ],
    },
  },
  {
    image: '/enemies/forest/Sporecap.webp',
    spriteScale: 0.55,
    spriteGroundOffset: 5,
    xpOrbRadius: 60,
    xpOrbOffset: 100,
    xp: 57,
    combatant: {
      name: 'Sporecap',
      maxHp: 41,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 2200 },
      skills: [
        {
          id: 'spore-cloud',
          name: 'Spore Cloud',
          category: 'attack',
          cooldown: 8000,
          effects: [{ type: 'curse', healingReduction: 0.5, duration: 5000 }],
        },
      ],
    },
  },
  {
    image: '/enemies/forest/Snapvine.webp',
    spriteScale: 0.45,
    spriteGroundOffset: 35,
    xpOrbRadius: 60,
    xpOrbOffset: 70,
    xp: 60,
    combatant: {
      name: 'Snapvine',
      maxHp: 43,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 2000 },
      skills: [
        {
          id: 'crush',
          name: 'Crush',
          category: 'attack',
          cooldown: 5000,
          effects: [
            { type: 'stun', duration: 1000 },
            { type: 'dmg', amount: 16 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/forest/Moss-Boar.webp',
    spriteScale: 0.8,
    spriteGroundOffset: 15,
    xpOrbRadius: 90,
    xpOrbOffset: 130,
    xp: 63,
    combatant: {
      name: 'Moss Boar',
      maxHp: 72,
      weapon: { name: 'Basic Attack', damage: 5, cooldown: 3000 },
      skills: [
        {
          id: 'trample',
          name: 'Trample',
          category: 'attack',
          cooldown: 9000,
          effects: [{ type: 'dmg', amount: 10 }],
        },
      ],
    },
  },
  {
    image: '/enemies/forest/Thorn-Dryad.webp',
    spriteScale: 1.2,
    spriteGroundOffset: 45,
    xpOrbRadius: 120,
    xpOrbOffset: 120,
    xp: 75,
    combatant: {
      name: 'Thorn Dryad',
      maxHp: 102,
      weapon: { name: 'Basic Attack', damage: 8, cooldown: 2000 },
      skills: [
        {
          id: 'entangling-roots',
          name: 'Entangling Roots',
          category: 'attack',
          cooldown: 9000,
          effects: [
            { type: 'agi', charges: 2 },
            { type: 'stun', duration: 1000 },
            { type: 'dmg', amount: 14 },
          ],
        },
      ],
    },
  },
]
