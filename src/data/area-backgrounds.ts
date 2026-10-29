import type {AreaName} from './areas'

export interface AreaBackground {
  image: string
  scale?: number
  xOffset?: number
  yOffset?: number
}

export const areaBackgrounds: Record<AreaName, AreaBackground> = {
  Field: {
    image: '/areas/field_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: -40,
  },
  Forest: {
    image: '/areas/forest_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: -50,
  },
  Cave: {
    image: '/areas/cave_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: -63,
  },
  Wasteland: {
    image: '/areas/wasteland_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: -45,
  },
  Ruins: {
    image: '/areas/ruins_bg.webp',
    scale: 1.3,
    xOffset: 8,
    yOffset: -55,
  },
  Dungeon: {
    image: '/areas/dungeon_bg.webp',
    scale: 1.3,
    xOffset: -5,
    yOffset: 45,
  },
  Hell: {
    image: '/areas/hell_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: -45,
  },
  Abyss: {
    image: '/areas/abyss_bg.webp',
    scale: 1.3,
    xOffset: 0,
    yOffset: 0,
  },
}
