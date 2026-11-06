import type { Monster } from '@/types/monster.ts'

/**
 * TODO: Stages 1–5 (Field + Forest), in stage order. Stats are still the original Level 40 values and
 * await their Level 40 2 rework (see `.documentation/enemies.md`).
 */
export const forestMonsters: Monster[] = [
  {
    image: '/enemies/forest/slime.webp',
    spriteScale: 0.4,
    xpOrbRadius: 80,
    xpOrbOffset: 20,
    xp: 18,
    combatant: {
      name: 'Slime',
      maxHp: 21,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 3000 },
      skills: [],
    },
  },
  {
    image: '/enemies/forest/wild-boar.webp',
    spriteScale: 0.65,
    xpOrbRadius: 120,
    xpOrbOffset: 60,
    xp: 20,
    combatant: {
      name: 'Wild Boar',
      maxHp: 24,
      weapon: { name: 'Basic Attack', damage: 4, cooldown: 4000 },
      skills: [
        { id: 'charge', name: 'Charge', category: 'attack', cooldown: 10000, effects: [{ type: 'dmg', amount: 7 }] },
      ],
    },
  },
  {
    image: '/enemies/forest/moss-boar.webp',
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
    image: '/enemies/forest/sporecap.webp',
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
    image: '/enemies/forest/thorn-dryad.webp',
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
