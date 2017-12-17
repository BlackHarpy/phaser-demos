'use strict'
import { ITEM_TYPES } from './../constants'

export const DARK_SWORD = {
  id: 1,
  type: ITEM_TYPES.WEAPON,
  name: 'Dark Sword',
  stats: {
    attack: 10,
    accuracy: 30
  }
}

export const SPEAR = {
  id: 2,
  type: ITEM_TYPES.WEAPON,
  name: 'Spear',
  stats: {
    attack: 9,
    accuracy: 49
  }
}

export const DARK_ARMOR = {
  id: 3,
  type: ITEM_TYPES.ARMOR,
  name: 'Dark Armor',
  stats: {
    defense: 5,
    magicDefense: 1,
    evasion: -10,
    magicEvasion: 0
  }
}

export const IRON_ARMOR = {
  id: 4,
  type: ITEM_TYPES.ARMOR,
  name: 'Iron Armor',
  stats: {
    defense: 4,
    magicDefense: 1,
    evasion: -10,
    magicEvasion: 0
  }
}