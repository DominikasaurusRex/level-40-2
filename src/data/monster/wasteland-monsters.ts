import type { Monster } from '@/types/monster.ts'

export const wastelandMonsters: Monster[] = [
  {
    image: '/enemies/wasteland/frilled-lizard.webp',
    spriteScale: 0.60,
    spriteGroundOffset: 15,
    xpOrbRadius: 70,
    xpOrbOffset: 60,
    xp: 486,
    combatant: {
      name: 'Frilled Lizard',
      maxHp: 176,
      weapon: { name: 'Basic Attack', damage: 4, cooldown: 1500 },
      skills: [
        {
          id: 'frilled-rush',
          name: 'Frilled Rush',
          category: 'attack',
          cooldown: 5000,
          startsReady: true,
          effects: [
            { type: 'agi', charges: 1 },
            { type: 'dmg', amount: 8 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/wasteland/raptor.webp',
    spriteScale: 0.8,
    spriteWallOffset: -20,
    spriteGroundOffset: 10,
    xpOrbRadius: 90,
    xpOrbOffset: 150,
    xp: 513,
    combatant: {
      name: 'Raptor',
      maxHp: 200,
      weapon: { name: 'Basic Attack', damage: 4, hits: 2, cooldown: 2000 },
      skills: [
        {
          id: 'frenzy',
          name: 'Frenzy',
          category: 'attack',
          cooldown: 7000,
          effects: [
            { type: 'dmg', amount: 4 },
            { type: 'dmg', amount: 4 },
            { type: 'dmg', amount: 4 },
            { type: 'dmg', amount: 4 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/wasteland/ankyllosaur.webp',
    spriteScale: 0.9,
    spriteGroundOffset: -8,
    xpOrbRadius: 80,
    xpOrbOffset: 100,
    xp: 540,
    combatant: {
      name: 'Ankylosaur',
      maxHp: 232,
      weapon: { name: 'Basic Attack', damage: 8, cooldown: 3000 },
      skills: [
        {
          id: 'harden',
          name: 'Harden',
          category: 'guard',
          cooldown: 6000,
          startsReady: true,
          effects: [{ type: 'def', amount: 14 }],
        },
        {
          id: 'spiked-tail',
          name: 'Spiked Tail',
          category: 'attack',
          cooldown: 9000,
          effects: [
            { type: 'dmg', amount: 16 },
            { type: 'bleed', amountPerTick: 4, tickInterval: 1000, duration: 4000 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/wasteland/sauropod.webp',
    spriteScale: 1,
    spriteGroundOffset: 1,
    xpOrbRadius: 100,
    xpOrbOffset: 150,
    xp: 567,
    combatant: {
      name: 'Sauropod',
      maxHp: 352,
      weapon: { name: 'Basic Attack', damage: 14, cooldown: 4000 },
      skills: [
        {
          id: 'stomp',
          name: 'Stomp',
          category: 'attack',
          cooldown: 10000,
          effects: [
            { type: 'stun', duration: 1800 },
            { type: 'dmg', amount: 34 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/wasteland/wyvern.webp',
    spriteScale: 1.2,
    spriteGroundOffset: 80,
    xpOrbRadius: 100,
    xpOrbOffset: 120,
    xp: 675,
    combatant: {
      name: 'Wyvern',
      maxHp: 448,
      weapon: { name: 'Basic Attack', damage: 11, cooldown: 2500 },
      skills: [
        {
          id: 'take-flight',
          name: 'Take Flight',
          category: 'guard',
          cooldown: 9000,
          effects: [{ type: 'agi', charges: 2 }],
        },
        {
          id: 'dive',
          name: 'Dive',
          category: 'attack',
          cooldown: 10000,
          effects: [{ type: 'dmg', amount: 38 }],
        },
        {
          id: 'fire-breath',
          name: 'Fire Breath',
          category: 'attack',
          cooldown: 12000,
          effects: [{ type: 'bleed', amountPerTick: 4, tickInterval: 1000, duration: 4000 }],
        },
      ],
    },
  },
]
