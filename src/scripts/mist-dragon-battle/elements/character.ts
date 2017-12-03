'use strict'

interface IAnimations {
  walk: string
}

export default class Character {
  game: Phaser.Game
  sprite: Phaser.Sprite
  animations: IAnimations

  constructor(game: Phaser.Game, spriteKey: string, animationsKeys?: string[]) {
    this.game = game
    this.sprite = this.game.add.sprite(0, 0, spriteKey)
    this.animations = {
      walk: `${spriteKey}Walk`
    }
    this.sprite.scale.setTo(1.6)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
  }

  setToBattle(referenceHeight: number, partySize: number, position: number): void {
    this.sprite.x = this.game.world.width
    this.game.add.tween(this.sprite).to({x: this.game.world.centerX * 1.6}, 100, Phaser.Easing.Linear.None, true)
    this.sprite.y = referenceHeight / (partySize + 1) * (position + 1)
  }

  goToFront(): void {
    this.sprite.loadTexture(this.animations.walk, 0)
    this.sprite.animations.add(this.animations.walk)
    this.sprite.animations.play(this.animations.walk, 10, true)
  }

  update(): void {

  }
  
}