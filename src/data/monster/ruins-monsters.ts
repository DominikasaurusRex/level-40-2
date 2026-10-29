import type { Monster } from '@/types/monster.ts'

export const ruinsMonsters: Monster[] = [
  {
    image: '/enemies/ruins/animated-armor.webp',
    spriteScale: 0.8,
    spriteGroundOffset: 10,
    xpOrbRadius: 80,
    xpOrbOffset: 100,
    xp: 1458,
    combatant: {
      name: 'Animated Armor',
      maxHp: 306,
      weapon: { name: 'Basic Attack', damage: 10, cooldown: 2500 },
      skills: [
        {
          id: 'reinforce',
          name: 'Reinforce',
          category: 'guard',
          cooldown: 6000,
          startsReady: true,
          effects: [{ type: 'def', amount: 18 }],
        },
      ],
    },
  },
  {
    image: '/enemies/ruins/gargoyl.webp',
    spriteScale: 0.9,
    spriteGroundOffset: 5,
    xpOrbRadius: 80,
    xpOrbOffset: 110,
    xp: 1539,
    combatant: {
      name: 'Gargoyle',
      maxHp: 333,
      weapon: { name: 'Basic Attack', damage: 10, cooldown: 2400 },
      skills: [
        {
          id: 'stone-swoop',
          name: 'Stone Swoop',
          category: 'attack',
          cooldown: 8000,
          effects: [
            { type: 'agi', charges: 2 },
            { type: 'dmg', amount: 24 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/ruins/ancient-sentinel.webp',
    spriteScale: 0.8,
    spriteGroundOffset: 5,
    xpOrbRadius: 80,
    xpOrbOffset: 120,
    xp: 1620,
    combatant: {
      name: 'Ancient Sentinel',
      maxHp: 378,
      weapon: { name: 'Basic Attack', damage: 11, cooldown: 4000 },
      skills: [
        {
          id: 'crushing-blow',
          name: 'Crushing Blow',
          category: 'attack',
          cooldown: 10000,
          effects: [
            { type: 'stun', duration: 1800 },
            { type: 'dmg', amount: 46 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/ruins/wraith.webp',
    spriteScale: 0.6,
    spriteGroundOffset: 100,
    xpOrbRadius: 80,
    xpOrbOffset: 80,
    xp: 1701,
    combatant: {
      name: 'Wraith',
      maxHp: 315,
      weapon: { name: 'Basic Attack', damage: 9, cooldown: 2200 },
      skills: [
        {
          id: 'ethereal-assault',
          name: 'Ethereal Assault',
          category: 'attack',
          cooldown: 7000,
          effects: [
            { type: 'invincible', duration: 3000 },
            { type: 'bleed', amountPerTick: 7, tickInterval: 1000, duration: 4000 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/ruins/ruined-colossus.webp',
    spriteScale: 1.25,
    spriteGroundOffset: 25,
    xpOrbRadius: 160,
    xpOrbOffset: 150,
    xp: 2025,
    combatant: {
      name: 'Ruined Colossus',
      maxHp: 774,
      weapon: { name: 'Basic Attack', damage: 27, cooldown: 4000 },
      skills: [
        {
          id: 'stone-bulwark',
          name: 'Stone Bulwark',
          category: 'guard',
          cooldown: 9000,
          startsReady: true,
          effects: [{ type: 'def', amount: 10 }],
        },
        {
          id: 'ruinous-slam',
          name: 'Ruinous Slam',
          category: 'attack',
          cooldown: 12000,
          effects: [
            { type: 'stun', duration: 2000 },
            { type: 'dmg', amount: 66 },
          ],
        },
      ],
    },
  },
]
