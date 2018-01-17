import { CHARACTER_STATUS } from './../constants'

export const CECIL = {
  id: 1,
  atlasKey: 'cecil',
  name: 'Cecil',
  level: 11,
  status: CHARACTER_STATUS.NORMAL,
  ATB: 0,    
  stats: {
    HP: 200,
    MP: 0,
    STRENGTH: 15,
    SPEED: 12,
    STAMINA: 13,
    INTELLECT: 6,
    SPIRIT: 3,
    ATTACK: 0,
    ACCURACY: 0,
    EVASION: 0,
    DEFENSE: 0,
    MAGIC_DEFENSE: 0,
    MAGIC_EVASION: 0
  }
}

export const KAIN = {
  id: 2,
  atlasKey: 'kain',
  name: 'Kain',
  level: 11,
  status: CHARACTER_STATUS.NORMAL,
  ATB: 0,  
  stats: {
    HP: 190,
    MP: 0,
    STRENGTH: 11,
    SPEED: 11,
    STAMINA: 11,
    INTELLECT: 8,
    SPIRIT: 14,
    ATTACK: 0,
    ACCURACY: 0,
    EVASION: 0,
    DEFENSE: 0,
    MAGIC_DEFENSE: 0,
    MAGIC_EVASION: 0
  }
}

export const MIST_DRAGON = {
  id: 1,
  atlasKey: 'mistDragon',
  name: 'Mist Dragon',
  level: 12,
  status: CHARACTER_STATUS.NORMAL,
  ATB: 0,  
  stats: {
    HP: 556,
    MP: 0,
    STRENGTH: 20,
    SPEED: 8,
    STAMINA: 12,
    INTELLECT: 10,
    SPIRIT: 10,
    ATTACK: 12,
    ACCURACY: 115,
    EVASION: 15,
    DEFENSE: 10,
    MAGIC_DEFENSE: 10,
    MAGIC_EVASION: 15
  },
  customFlags: [{ key: 'hitWhileMist', active: false }]
}