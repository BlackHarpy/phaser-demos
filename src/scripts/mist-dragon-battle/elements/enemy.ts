import { MENU_HEIGHT } from './../constants';
'use strict'

import {SCALE} from '../constants'

interface ITransformation {
  id: number,
  key: string
}

export default class Enemy implements Enemy.Base {
  game: Phaser.Game
  id: number  
  atlasKey: string
  sprite: Phaser.Sprite  
  name: string
  level: number
  status: number
  stats: IStats
  ATB: number
  transformations: ITransformation[]
  commands: ICommand[]

  constructor(game: Phaser.Game, enemyConstructor: any) {
    this.game = game
    this.id = enemyConstructor.id
    this.sprite = this.setSprite(enemyConstructor.atlasKey)
    this.name = enemyConstructor.name
    this.level = enemyConstructor.level
    this.status = enemyConstructor.status
    this.stats = enemyConstructor.stats
    this.ATB = enemyConstructor.ATB
    this.commands = enemyConstructor.commands
  }

  setSprite(atlasKey: string): Phaser.Sprite {
    const sprite: Phaser.Sprite = new Phaser.Sprite(this.game, 0, 0, atlasKey, 'stand0')
    sprite.scale.setTo(SCALE)
    sprite.smoothed = false
    sprite.anchor.set(0.5, 0.5)
    return this.game.add.existing(sprite)
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