'use strict'

import {SCALE} from '../constants'

interface IAnimationData {
  key: string,
  animation?: Phaser.Animation,
  play?()
  stop?()
}

interface IAnimations {
  walk: IAnimationData
}

export default class Character {
  game: Phaser.Game
  sprite: Phaser.Sprite
  animations: IAnimations
  initialPosition: number
  mainSpriteKey: string

  constructor(game: Phaser.Game, spriteKey: string, animationsKeys?: string[]) {
    this.game = game
    this.sprite = this.game.add.sprite(0, 0, spriteKey)
    this.mainSpriteKey = spriteKey
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
    this.addAnimations(spriteKey)
  }

  addAnimations(spriteKey: string) {
    this.animations = {
      walk: {
        key: `${spriteKey}Walk`,
        animation: this.sprite.animations.add( `${spriteKey}Walk`, [1,0]),
      }
    }
    this.animations.walk.play = () => {
      this.animations.walk.animation.play(15, true)
    }
    this.animations.walk.stop = () => {
      this.animations.walk.animation.stop()
    }
  }

  setToBattle(referenceHeight: number, partySize: number, position: number): void {
    this.sprite.x = this.game.world.width
    this.game.add.tween(this.sprite).to({x: this.game.world.centerX * 1.6}, 100, Phaser.Easing.Linear.None, true)
    this.sprite.y = referenceHeight / (partySize + 1) * (position + 1)
    this.initialPosition = this.game.world.centerX * 1.6
  }

  walkToPosition(position: number) {
    this.animations.walk.play()
    this.sprite.loadTexture(this.animations.walk.key, 1)        
    const tween = this.game.add.tween(this.sprite).to({x: position}, 100, "Linear", true)
    tween.onComplete.add(this.resetPosition, this)    
  }

  goToFront(): void {
    this.walkToPosition(this.sprite.x - 50)
    
  }

  goToBack(): void {
    this.sprite.scale.x = -SCALE
    this.walkToPosition(this.initialPosition)
  }

  resetPosition(): void {
    this.sprite.loadTexture(this.mainSpriteKey, 0, true)
    this.sprite.scale.x = SCALE    
  }

  update(): void {
  }
  
}