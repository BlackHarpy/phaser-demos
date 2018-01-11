import { ITEM_TYPES } from './../constants'

export const DARK_SWORD = {
  id: 1,
  type: ITEM_TYPES.WEAPON,
  name: 'Dark Sword',
  stats: {
    ATTACK: 10,
    ACCURACY: 30
  }
}

export const SPEAR = {
  id: 2,
  type: ITEM_TYPES.WEAPON,
  name: 'Spear',
  stats: {
    ATTACK: 9,
    ACCURACY: 49
  }
}

export const DARK_ARMOR = {
  id: 3,
  type: ITEM_TYPES.ARMOR,
  name: 'Dark Armor',
  stats: {
    DEFENSE: 5,
    MAGIC_DEFENSE: 1,
    EVASION: -10,
    MAGIC_EVASION: 0
  }
}

export const IRON_ARMOR = {
  id: 4,
  type: ITEM_TYPES.ARMOR,
  name: 'Iron Armor',
  stats: {
    DEFENSE: 4,
    MAGIC_DEFENSE: 1,
    EVASION: -10,
    MAGIC_EVASION: 0
  }
}