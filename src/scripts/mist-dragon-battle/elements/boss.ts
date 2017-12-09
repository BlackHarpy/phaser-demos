'use strict'

import {SCALE} from '../constants'

interface ITransformation {
  id: number,
  key: string
}

export default class Boss {
  game: Phaser.Game
  name: string
  stats: Character.Stats
  ATB: number
  sprite: Phaser.Sprite
  transformations: ITransformation[]

  constructor(game: Phaser.Game, spriteKey: string) {
    this.game = game
    this.sprite = game.add.sprite(0, 0, spriteKey, 'stand0')
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
  }

  setToBattle(referenceCenterY: number, referenceCenterX: number): void {
    this.sprite.y = referenceCenterY
    this.game.add.tween(this.sprite).to({x: referenceCenterX / 2},100, Phaser.Easing.Linear.None, true);
  }

  blink(): void {
    const tintTimer = this.game.time.create(false)
    enum tints  {
      light = 0xffffff,
      dark = 0x918e8c
    }
    let key: boolean = true
    let loop: number = 0
    tintTimer.loop(Phaser.Timer.QUARTER / 3, () => {
      key = !key
      this.sprite.tint = key ? tints.dark : tints.light
      loop++
      if (loop === 7) {
        tintTimer.stop()
        tintTimer.destroy()
      }
    })
    tintTimer.start()

  }
  

}