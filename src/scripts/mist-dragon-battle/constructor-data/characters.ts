'use strict'
import { CHARACTER_STATUS } from './../constants'

export const CECIL = {
  id: 1,
  atlasKey: 'cecil',
  name: 'Cecil',
  level: 10,
  status: CHARACTER_STATUS.NORMAL,
  ATB: 0,    
  stats: {
    HP: 200,
    MP: 0,
    STRENGTH: 13,
    SPEED: 10,
    STAMINA: 11,
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
  level: 10,
  status: CHARACTER_STATUS.NORMAL,
  ATB: 0,  
  stats: {
    HP: 190,
    MP: 0,
    STRENGTH: 9,
    SPEED: 11,
    STAMINA: 9,
    INTELLECT: 6,
    SPIRIT: 12,
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
    STRENGTH: 12,
    SPEED: 6,
    STAMINA: 12,
    INTELLECT: 6,
    SPIRIT: 6,
    ATTACK: 0,
    ACCURACY: 0,
    EVASION: 0,
    DEFENSE: 0,
    MAGIC_DEFENSE: 0,
    MAGIC_EVASION: 0
  },
  customFlags: [{ key: 'hitWhileMist', active: false }],
  commands: [{
    id: 1,
    method: () => {
      //Normal Attack
      this.blink()
    }
  }, {
    id: 2,
    method: () => {
      //Freezing Mist Special Ability
      this.blink()
    }
  }, {
    id: 3,
    method: () => {
      //Transform to Mist
    }
  }]
}