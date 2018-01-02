'use strict'

import { Character } from './character'
import { Enemy } from './enemy'
import { CHARACTER_STATUS } from './../constants';

function numbersBounce (game: Phaser.Game, number: string, sprite: Phaser.Sprite, tint: number): Promise<boolean> {
  return new Promise (resolve => {
    const num: string[] = number.split('')
    const damageText: Phaser.BitmapText[] = []
    let x: number = sprite.centerX - (10 * num.length)
    num.forEach((digit, index) => {
      const digitText = new Phaser.BitmapText(game, x, sprite.centerY, 'ffNumbers', digit, 25)
      digitText.tint = tint
      damageText.push(digitText)
      game.add.existing(damageText[index])
      game.add.tween(damageText[index]).to({ y: sprite.centerY - 150 }, 500, Phaser.Easing.Linear.None, true, 100 * index, 0)
      game.add.tween(damageText[index]).to({ y: sprite.centerY + 50 }, 500, Phaser.Easing.Bounce.Out, true,  100 * index, 0).onComplete.add(() => {
        if (index === damageText.length - 1) {
          damageText.forEach(digit => {
            digit.destroy()
          })
          resolve(true)
        }
      })
      x += 20
    })
  })
}

export class BattleMechanics {

  static setInitialATB(party: Character[]): Character[] {
    return party.map(character => {
      character.ATB = Math.floor(Math.random() * 101)
      return character
    })
  }

  static getAvailableForTargeting(party: Character[]): number[] {

    return party.filter(target => {
      if (target.status !== CHARACTER_STATUS.JUMP) {
        return target.id
      }
    }).map(character => { return character.id })
  }

  static calculateDamage(attacker: Character | Enemy, target: Character | Enemy): number {
    return 50
  }

  static showDamage(game: Phaser.Game, damage: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, damage, sprite, 0xFFFFFF)
  }

  static showRecoveredHP(game: Phaser.Game, recovered: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, recovered, sprite, 0x50d424)
  }

}