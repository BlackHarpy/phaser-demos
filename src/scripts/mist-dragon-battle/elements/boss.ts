'use strict'

import {SCALE} from '../constants'

interface ITransformation {
  id: number,
  key: string
}

export default class Boss {
  game: Phaser.Game
  sprite: Phaser.Sprite
  transformations: ITransformation[]

  constructor(game: Phaser.Game, spriteKey: string) {
    this.game = game
    this.sprite = game.add.sprite(0, 0, 'mistDragon')
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
  }

  setToBattle(referenceCenterY: number, referenceCenterX: number): void {
    this.sprite.y = referenceCenterY
    this.game.add.tween(this.sprite).to({x: referenceCenterX / 2},100, Phaser.Easing.Linear.None, true);
  }

}