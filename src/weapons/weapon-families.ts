export enum WeaponFamilyId {
  DualBlades = 'dual-blades',
  SwordAndShield = 'sword-and-shield',
  Hammer = 'hammer',
  Staff = 'staff',
}

export interface WeaponFamily {
  id: WeaponFamilyId
  name: string
}

export const weaponFamilies: readonly WeaponFamily[] = [
  { id: WeaponFamilyId.DualBlades, name: 'Dual Blades' },
  { id: WeaponFamilyId.SwordAndShield, name: 'Sword & Shield' },
  { id: WeaponFamilyId.Hammer, name: 'Hammer' },
  { id: WeaponFamilyId.Staff, name: 'Staff' },
]
