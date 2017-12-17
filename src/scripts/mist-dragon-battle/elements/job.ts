'use strict'

import { Character } from '../elements/character'
import { Enemy } from '../elements/enemy'

export class Job implements Job.Base {
  specialAttack: Job.SpecialAttack
  fillATB: Function

  constructor(game: Phaser.Game, jobConstructor: any) {
    this.specialAttack = jobConstructor.specialAttack
    this.fillATB = jobConstructor.fillATB
  }

  performSpecialAttack(character: Character, target: Enemy): Promise<Boolean> {
    return (this.specialAttack.perform(character, target))
  }

}