'use strict'

import { SCALE } from './../constants'

export class Equipment implements Equipment.Base {
  game: Phaser.Game
  id: number
  type: number  
  name: string
  stats: Equipment.WeaponStats | Equipment.ArmorStats
  sprite?: Phaser.Sprite  

  constructor(game: Phaser.Game, id: number, name: string, type: string, stats: Equipment.ArmorStats | Equipment.WeaponStats,  spriteKey?: string) {
    this.game = game
    this.id = id
    this.name = name
    if (spriteKey) {
      this.sprite = new Phaser.Sprite(game, 0, 0, spriteKey)
      this.sprite.scale.setTo(SCALE)
      this.sprite.smoothed = false
    }
  }
}