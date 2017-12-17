'use strict'

import { SCALE, ITEM_TYPES } from './../constants'

export class Equipment implements Equipment.Base {
  game: Phaser.Game
  id: number
  type: number  
  name: string
  stats: Equipment.WeaponStats | Equipment.ArmorStats
  sprite?: Phaser.Sprite  

  constructor(game: Phaser.Game, equipmentConstructor: Equipment.Constructor) {
    this.game = game
    this.id = equipmentConstructor.id
    this.name = equipmentConstructor.name
    if (equipmentConstructor.spriteKey) {
      this.sprite = new Phaser.Sprite(game, 0, 0, equipmentConstructor.spriteKey)
      this.sprite.scale.setTo(SCALE)
      this.sprite.smoothed = false
    }
  }
}