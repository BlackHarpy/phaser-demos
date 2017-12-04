'use strict'

import {SCALE} from '../constants'
import Job from '../elements/job'
import Boss from '../elements/boss'

interface IPosition {
  x: number,
  y: number
}

interface IAnimationData {
  animation?: Phaser.Animation,
  play?(onEndCallback?: Function)
}

interface IAnimations {
  walk: IAnimationData,
  attack?: IAnimationData,
  victory?: IAnimationData
}

export default class Character {
  game: Phaser.Game
  sprite: Phaser.Sprite
  job: Job
  animations: IAnimations
  initialPosition: IPosition
  mainSpriteKey: string

  constructor(game: Phaser.Game, spriteKey: string, animationsKeys?: string[]) {
    this.game = game
    this.sprite = this.game.add.sprite(0, 0, spriteKey, 'stand')
    this.job = new Job(this.game)
    this.mainSpriteKey = spriteKey
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
    this.addAnimations(spriteKey)
  }

  addAnimations(spriteKey: string) {
    this.animations = {
      walk: {
        animation: this.sprite.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 1), 15, true),
        play: () => {
          this.sprite.animations.play('walk')
        }
      },
      attack: {
        animation: this.sprite.animations.add('attack', Phaser.Animation.generateFrameNames('attack', 0, 1), 8, true),
        play: () => {
          this.sprite.animations.play('attack')
          this.sprite.animations.getAnimation('attack').onLoop.add((sprite, animation) => {
            if (animation.loopCount === 2) {
              this.sprite.animations.stop('attack')
              this.goToBack()
            }
          }, this)
        }
      },
      victory: {
        animation: this.sprite.animations.add('victory', Phaser.Animation.generateFrameNames('victory', 0, 1), 5, true),
        play: () => {
          this.sprite.animations.play('victory')
        }
      }
    }
  }

  setToBattle(referenceHeight: number, partySize: number, position: number): void {
    this.sprite.x = this.game.world.width
    this.game.add.tween(this.sprite).to({x: this.game.world.centerX * SCALE}, 100, Phaser.Easing.Linear.None, true)
    this.sprite.y = referenceHeight / (partySize + 1) * (position + 1)
    this.initialPosition = {
      x: this.game.world.centerX * SCALE,
      y: this.sprite.y
    }
  }

  attack(): void {
    this.goToFront(this.makeAttackAnimation)
  }

  victory(): void {
    this.animations.victory.play()
  }

  walkToPosition(position: number, additionalCallback?: Function) {
    this.animations.walk.play()
    const tween = this.game.add.tween(this.sprite).to({x: position}, 100, "Linear", true)
    if (additionalCallback) {
      tween.onComplete.add(additionalCallback, this)   
    } else {
      tween.onComplete.add(this.resetPosition, this)         
    }
  }

  makeAttackAnimation() {
    this.animations.attack.play()
  }

  specialAttack() {
    this.job.jumpAnimation(this)
  }

  finishJump(target: Boss) {
    this.job.finishJump(this, target)
  }

  goToFront(additionalCallback?: Function): void {
    this.walkToPosition(this.sprite.x - 50, additionalCallback)
  }

  goToBack(): void {
    this.sprite.scale.x = -SCALE
    this.walkToPosition(this.initialPosition.x)
  }

  resetPosition(): void {
    this.sprite.loadTexture(this.mainSpriteKey, 'stand')
    this.sprite.scale.x = SCALE    
  }

  update(): void {
  }
  
}