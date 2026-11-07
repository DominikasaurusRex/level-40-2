import { DamageResponse, DamageType, StatusResponse } from '@/combat/damage'
import { EffectTarget, EffectType } from '@/combat/skill-effect'
import type { MonsterDefinition } from '@/monsters/monster-definition'

/**
 * TODO: Stages 6–10 (Cave), in stage order. All numbers are placeholders based on the original
 * Level 40 values. Elements, responses, weaknesses, and material drops are not designed yet (see
 * `.documentation/enemies.md`).
 */
export const caveMonsters: MonsterDefinition[] = [
  {
    name: 'Cave Bat',
    boss: false,
    maxHp: 91,
    damageResponses: {
      physical: DamageResponse.Normal,
      fire: DamageResponse.Normal,
      ice: DamageResponse.Normal,
      thunder: DamageResponse.Normal,
    },
    statusResponses: {
      poison: StatusResponse.Normal,
      stun: StatusResponse.Normal,
    },
    weapon: { name: 'Bite', hit: { physical: 2 }, hits: 1, cooldown: 1200, initialCooldown: 1200 },
    skills: [
      {
        id: 'cave-bat-evasive-flight',
        name: 'Evasive Flight',
        description: 'Gains evasion',
        cooldown: 8000,
        initialCooldown: 8000,
        effects: [{ type: EffectType.Agi, target: EffectTarget.Self, charges: 2 }],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 162, gold: { min: 20, max: 30 }, drops: [] },
    sprite: { image: '/enemies/cave/cave-bat.webp', scale: 0.55, groundOffset: 135 },
  },
  {
    name: 'Stone Tortoise',
    boss: false,
    maxHp: 105,
    damageResponses: {
      physical: DamageResponse.Normal,
      fire: DamageResponse.Normal,
      ice: DamageResponse.Normal,
      thunder: DamageResponse.Normal,
    },
    statusResponses: {
      poison: StatusResponse.Normal,
      stun: StatusResponse.Normal,
    },
    weapon: { name: 'Bite', hit: { physical: 4 }, hits: 1, cooldown: 3000, initialCooldown: 3000 },
    skills: [
      {
        id: 'stone-tortoise-stone-shell',
        name: 'Stone Shell',
        description: 'Becomes immune to Physical damage',
        cooldown: 8000,
        initialCooldown: 2000,
        effects: [
          {
            type: EffectType.DamageResponse,
            target: EffectTarget.Self,
            damageTypes: [DamageType.Physical],
            response: DamageResponse.Immune,
            duration: 3000,
          },
        ],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 171, gold: { min: 20, max: 32 }, drops: [] },
    sprite: { image: '/enemies/cave/stone-tortoise.webp', scale: 0.75, groundOffset: 15 },
  },
  {
    name: 'Ankylosaur',
    boss: false,
    maxHp: 232,
    damageResponses: {
      physical: DamageResponse.Normal,
      fire: DamageResponse.Normal,
      ice: DamageResponse.Normal,
      thunder: DamageResponse.Normal,
    },
    statusResponses: {
      poison: StatusResponse.Normal,
      stun: StatusResponse.Normal,
    },
    weapon: { name: 'Tail Club', hit: { physical: 8 }, hits: 1, cooldown: 3000, initialCooldown: 3000 },
    skills: [
      {
        id: 'ankylosaur-harden',
        name: 'Harden',
        description: 'Resists Fire, Ice, and Thunder damage',
        cooldown: 8000,
        initialCooldown: 2000,
        effects: [
          {
            type: EffectType.DamageResponse,
            target: EffectTarget.Self,
            damageTypes: [DamageType.Fire, DamageType.Ice, DamageType.Thunder],
            response: DamageResponse.Resisted,
            duration: 4000,
          },
        ],
      },
      {
        id: 'ankylosaur-spiked-tail',
        name: 'Spiked Tail',
        description: 'Physical attack that poisons you',
        cooldown: 9000,
        initialCooldown: 9000,
        effects: [
          { type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 16 }, hits: 1 },
          {
            type: EffectType.Poison,
            target: EffectTarget.Opponent,
            amountPerTick: 4,
            tickInterval: 1000,
            duration: 4000,
          },
        ],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 540, gold: { min: 30, max: 45 }, drops: [] },
    sprite: { image: '/enemies/cave/ankylosaur.webp', scale: 0.9, groundOffset: -8 },
  },
  {
    name: 'Cave Mantis',
    boss: false,
    maxHp: 133,
    damageResponses: {
      physical: DamageResponse.Normal,
      fire: DamageResponse.Normal,
      ice: DamageResponse.Normal,
      thunder: DamageResponse.Normal,
    },
    statusResponses: {
      poison: StatusResponse.Normal,
      stun: StatusResponse.Normal,
    },
    weapon: { name: 'Scythe Arms', hit: { physical: 2 }, hits: 2, cooldown: 1800, initialCooldown: 1800 },
    skills: [
      {
        id: 'cave-mantis-flurry',
        name: 'Flurry',
        description: 'Many quick Physical hits',
        cooldown: 6500,
        initialCooldown: 6500,
        effects: [{ type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 4 }, hits: 3 }],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 189, gold: { min: 22, max: 34 }, drops: [] },
    sprite: { image: '/enemies/cave/cave-mantis.webp', scale: 0.75, groundOffset: 15 },
  },
  {
    name: 'Sauropod',
    boss: true,
    maxHp: 352,
    damageResponses: {
      physical: DamageResponse.Normal,
      fire: DamageResponse.Normal,
      ice: DamageResponse.Normal,
      thunder: DamageResponse.Normal,
    },
    statusResponses: {
      poison: StatusResponse.Normal,
      stun: StatusResponse.Normal,
    },
    weapon: { name: 'Stamp', hit: { physical: 14 }, hits: 1, cooldown: 4000, initialCooldown: 4000 },
    skills: [
      {
        id: 'sauropod-stomp',
        name: 'Stomp',
        description: 'Stuns you and hits hard',
        cooldown: 10000,
        initialCooldown: 10000,
        effects: [
          { type: EffectType.Stun, target: EffectTarget.Opponent, duration: 1800 },
          { type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 34 }, hits: 1 },
        ],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 567, gold: { min: 40, max: 60 }, drops: [] },
    sprite: { image: '/enemies/cave/sauropod.webp', scale: 1, groundOffset: 1 },
  },
]
