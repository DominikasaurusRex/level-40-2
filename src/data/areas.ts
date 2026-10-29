export const areaNames = [
  'Field',
  'Forest',
  'Cave',
  'Wasteland',
  'Ruins',
  'Dungeon',
  'Hell',
  'Abyss',
] as const

export type AreaName = (typeof areaNames)[number]

export function isAreaName(value: string): value is AreaName {
  return (areaNames as readonly string[]).includes(value)
}

export function levelsForArea(area: AreaName): number[] {
  const areaIndex = areaNames.indexOf(area)
  return Array.from({ length: 5 }, (_, index) => areaIndex * 5 + index + 1)
}

export function isLevelInArea(area: AreaName, level: number): boolean {
  return levelsForArea(area).includes(level)
}

export function isAreaBossLevel(area: AreaName, level: number): boolean {
  return levelsForArea(area).at(-1) === level
}

export function areaForLevel(level: number): AreaName {
  return areaNames[Math.floor((level - 1) / 5)]!
}
