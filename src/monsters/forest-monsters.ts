import { DamageResponse, StatusResponse } from '@/combat/damage'
import { EffectTarget, EffectType } from '@/combat/skill-effect'
import type { MonsterDefinition } from '@/monsters/monster-definition'

/**
 * TODO: Stages 1–5 (Field + Forest), in stage order. All numbers are placeholders based on the
 * original Level 40 values. Elements, responses, weaknesses, and material drops are not designed
 * yet (see `.documentation/enemies.md`).
 */
export const forestMonsters: MonsterDefinition[] = [
  {
    name: 'Slime',
    boss: false,
    maxHp: 21,
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
    weapon: { name: 'Tackle', hit: { physical: 2 }, hits: 1, cooldown: 3000, initialCooldown: 3000 },
    skills: [],
    defensiveWeaknesses: [],
    rewards: { xp: 18, gold: { min: 4, max: 8 }, drops: [] },
    sprite: { image: '/enemies/forest/slime.webp', scale: 0.4 },
  },
  {
    name: 'Wild Boar',
    boss: false,
    maxHp: 24,
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
    weapon: { name: 'Tusk', hit: { physical: 4 }, hits: 1, cooldown: 4000, initialCooldown: 4000 },
    skills: [
      {
        id: 'wild-boar-charge',
        name: 'Charge',
        description: 'Heavy Physical attack',
        cooldown: 10000,
        initialCooldown: 10000,
        effects: [{ type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 7 }, hits: 1 }],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 20, gold: { min: 5, max: 9 }, drops: [] },
    sprite: { image: '/enemies/forest/wild-boar.webp', scale: 0.65 },
  },
  {
    name: 'Moss Boar',
    boss: false,
    maxHp: 72,
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
    weapon: { name: 'Tusk', hit: { physical: 5 }, hits: 1, cooldown: 3000, initialCooldown: 3000 },
    skills: [
      {
        id: 'moss-boar-trample',
        name: 'Trample',
        description: 'Heavy Physical attack',
        cooldown: 9000,
        initialCooldown: 9000,
        effects: [{ type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 10 }, hits: 1 }],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 63, gold: { min: 8, max: 14 }, drops: [] },
    sprite: { image: '/enemies/forest/moss-boar.webp', scale: 0.8, groundOffset: 15 },
  },
  {
    name: 'Sporecap',
    boss: false,
    maxHp: 41,
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
    weapon: { name: 'Cap Bash', hit: { physical: 2 }, hits: 1, cooldown: 2200, initialCooldown: 2200 },
    skills: [
      {
        id: 'sporecap-spore-cloud',
        name: 'Spore Cloud',
        description: 'Poisons you',
        cooldown: 8000,
        initialCooldown: 8000,
        effects: [
          {
            type: EffectType.Poison,
            target: EffectTarget.Opponent,
            amountPerTick: 2,
            tickInterval: 1000,
            duration: 5000,
          },
        ],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 57, gold: { min: 8, max: 13 }, drops: [] },
    sprite: { image: '/enemies/forest/sporecap.webp', scale: 0.55, groundOffset: 5 },
  },
  {
    name: 'Thorn Dryad',
    boss: true,
    maxHp: 102,
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
    weapon: { name: 'Thorn Lash', hit: { physical: 8 }, hits: 1, cooldown: 2000, initialCooldown: 2000 },
    skills: [
      {
        id: 'thorn-dryad-entangling-roots',
        name: 'Entangling Roots',
        description: 'Gains evasion, stuns you, and strikes',
        cooldown: 9000,
        initialCooldown: 9000,
        effects: [
          { type: EffectType.Agi, target: EffectTarget.Self, charges: 2 },
          { type: EffectType.Stun, target: EffectTarget.Opponent, duration: 1000 },
          { type: EffectType.Damage, target: EffectTarget.Opponent, hit: { physical: 14 }, hits: 1 },
        ],
      },
    ],
    defensiveWeaknesses: [],
    rewards: { xp: 75, gold: { min: 15, max: 25 }, drops: [] },
    sprite: { image: '/enemies/forest/thorn-dryad.webp', scale: 1.2, groundOffset: 45 },
  },
]
