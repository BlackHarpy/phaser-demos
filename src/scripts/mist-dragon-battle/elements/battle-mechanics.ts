'use strict'

import Character from './character'
import Enemy from './Enemy'

export default class BattleMechanics {

  static setInitialATB(party: Character[]): Character[] {
    return party.map(character => {
      character.ATB = Math.floor(Math.random() * 101)
      return character
    })
  }

  static calculateDamage(attacker: Character | Enemy, target: Character | Enemy): number {
    return 50
  }

}