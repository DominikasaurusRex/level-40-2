export enum DamageType {
  Physical = 'physical',
  Fire = 'fire',
  Ice = 'ice',
  Thunder = 'thunder',
}

export type ElementType = Exclude<DamageType, DamageType.Physical>

export enum DamageResponse {
  Absorb = 'absorb',
  Immune = 'immune',
  Resisted = 'resisted',
  Normal = 'normal',
  Vulnerable = 'vulnerable',
}

/** The statuses a target has a response to. */
export enum ResistibleStatus {
  Poison = 'poison',
  Stun = 'stun',
}

/** How a target takes one resistible status. */
export enum StatusResponse {
  Vulnerable = 'vulnerable',
  Normal = 'normal',
  Resistant = 'resistant',
  Immune = 'immune',
}

export type DamageResponses = Record<DamageType, DamageResponse>
export type StatusResponses = Record<ResistibleStatus, StatusResponse>

/** One hit: a Physical part (may be 0) plus at most one element. */
export interface HitDamage {
  physical: number
  element?: {
    type: ElementType
    amount: number
  }
}

/** The combat core the player and monsters share. */
export interface CombatantCore {
  name: string
  maxHp: number
  damageResponses: DamageResponses
  statusResponses: StatusResponses
}
