export enum AreaId {
  FieldForest = 'field-forest',
  Cave = 'cave',
  GlacialVolcano = 'glacial-volcano',
  StormyMountain = 'stormy-mountain',
  SummitTemple = 'summit-temple',
  BrokenTemple = 'broken-temple',
  MoonSurface = 'moon-surface',
  MoonInterior = 'moon-interior',
  Superbosses = 'superbosses',
}

export interface Area {
  id: AreaId
  name: string
  firstStage: number
  lastStage: number
}

export const areas: readonly Area[] = [
  { id: AreaId.FieldForest, name: 'Field + Forest', firstStage: 1, lastStage: 5 },
  { id: AreaId.Cave, name: 'Cave', firstStage: 6, lastStage: 10 },
  { id: AreaId.GlacialVolcano, name: 'Glacial Volcano', firstStage: 11, lastStage: 15 },
  { id: AreaId.StormyMountain, name: 'Stormy Mountain', firstStage: 16, lastStage: 20 },
  { id: AreaId.SummitTemple, name: 'Summit Temple', firstStage: 21, lastStage: 25 },
  { id: AreaId.BrokenTemple, name: 'Broken Temple', firstStage: 26, lastStage: 30 },
  { id: AreaId.MoonSurface, name: "Moon's Surface", firstStage: 31, lastStage: 35 },
  { id: AreaId.MoonInterior, name: "Moon's Interior", firstStage: 36, lastStage: 40 },
  { id: AreaId.Superbosses, name: 'Superbosses', firstStage: 41, lastStage: 42 },
]

export function areaById(id: AreaId): Area {
  return areas.find(area => area.id === id)!
}

export function stagesOf(area: Area): number[] {
  return Array.from({ length: area.lastStage - area.firstStage + 1 }, (_, i) => area.firstStage + i)
}
