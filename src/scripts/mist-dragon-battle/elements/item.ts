import { SCALE } from './../constants'

export class Item implements Item.Base {
  game: Phaser.Game
  id: number
  type: number  
  name: string
  menuSprite: Phaser.Sprite
  targetType: string
  targetStat: string
  modifier: number //Depends of item type

  constructor(game: Phaser.Game, itemConstructor: Item.Constructor) {
    this.game = game
    this.id = itemConstructor.id
    this.type = itemConstructor.type
    this.name = itemConstructor.name
    this.menuSprite = new Phaser.Sprite(game, 0, 0, itemConstructor.menuSpriteKey)
    this.menuSprite.scale.setTo(SCALE)
    this.menuSprite.smoothed = false
  }
}