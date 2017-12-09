'use strict'

import Character from '../elements/character'
import Boss from '../elements/boss'

export default class Job implements Job.Base {
  specialAttack: Job.SpecialAttack
  fillATB: Function

  constructor(game: Phaser.Game, jobConstructor: any) {
    this.specialAttack = jobConstructor.specialAttack
    this.fillATB = jobConstructor.fillATB
  }

  performSpecialAttack(character: Character, target: Boss): Promise<Boolean> {
    return (this.specialAttack.perform(character, target))
  }

}