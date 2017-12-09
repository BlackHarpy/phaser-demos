'use strict'

import Character from '../elements/character'
import Boss from '../elements/boss'

interface ISpecialAttack {
  key: string,
  name: string,
  chargeTime?: number,
  perform?: Function
}
export default class Job {
  specialAttack: ISpecialAttack
  fillATB: Function

  constructor(game: Phaser.Game, jobConstructor: any) {
    this.specialAttack = jobConstructor.specialAttack
    this.fillATB = jobConstructor.fillATB
  }

  performSpecialAttack(character: Character, target: Boss): Promise<Boolean> {
    return (this.specialAttack.perform(character, target))
  }

}