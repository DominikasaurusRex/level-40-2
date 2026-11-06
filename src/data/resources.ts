/**
 * The resources collected during runs and spent in Town, in resource-bar order.
 *
 * Every icon is the shield icon as a placeholder until resource icons exist.
 */
export enum ResourceId {
  Xp = 'xp',
  Gold = 'gold',
  Wood = 'wood',
  Silk = 'silk',
  Metal = 'metal',
  Crystal = 'crystal',
}

export interface Resource {
  id: ResourceId
  name: string
  icon: string
}

export type ResourceAmounts = Record<ResourceId, number>

/** The four materials: everything except the two currencies. */
export type MaterialId = Exclude<ResourceId, ResourceId.Xp | ResourceId.Gold>

const PLACEHOLDER_ICON = '/icons/defense.png'

export const resources: Resource[] = [
  { id: ResourceId.Xp, name: 'XP', icon: PLACEHOLDER_ICON },
  { id: ResourceId.Gold, name: 'Gold', icon: PLACEHOLDER_ICON },
  { id: ResourceId.Wood, name: 'Wood', icon: PLACEHOLDER_ICON },
  { id: ResourceId.Silk, name: 'Silk', icon: PLACEHOLDER_ICON },
  { id: ResourceId.Metal, name: 'Metal', icon: PLACEHOLDER_ICON },
  { id: ResourceId.Crystal, name: 'Crystal', icon: PLACEHOLDER_ICON },
]

export function initialResourceAmounts(): ResourceAmounts {
  return {
    [ResourceId.Xp]: 0,
    [ResourceId.Gold]: 0,
    [ResourceId.Wood]: 0,
    [ResourceId.Silk]: 0,
    [ResourceId.Metal]: 0,
    [ResourceId.Crystal]: 0,
  }
}
