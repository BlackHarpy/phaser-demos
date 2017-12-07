'use strict'

import Character from '../elements/character'
import Boss from '../elements/boss'

interface ISpecialAttack {
  key: string,
  name: string,
  chargeTime?: number,
  performSpecialAttack?: Function
}
export default class Job {
  specialAttack: ISpecialAttack
  fillATB: Function

  constructor(game: Phaser.Game, jobConstructor: any) {
    this.specialAttack = jobConstructor.specialAttack
    this.fillATB = jobConstructor.fillATB
  }

  performSpecialAttack(character: Character, target: Boss) {
    this.specialAttack.performSpecialAttack(character, target)
  }

}