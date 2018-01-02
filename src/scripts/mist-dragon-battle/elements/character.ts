import { COMMANDS, INITIAL_MENU_TEXT_POSITION_Y, CHARACTER_STATUS, ACTOR_TYPES } from './../constants';
'use strict'

import {SCALE} from '../constants'
import { Job } from '../elements/job'
import { Enemy } from '../elements/enemy'
import { BattleMechanics } from './battle-mechanics'

export class Character implements Character.Base {
  game: Phaser.Game
  id: number
  atlasKey: string  
  name: string
  level: number
  status: number
  sprite: Phaser.Sprite
  ATB: number
  stats: IStats
  job: Job.Base
  items: BattleMenu.ItemData[]
  animations: Character.Animations
  initialPosition: IPosition
  tintTimer: Phaser.Timer

  constructor(game: Phaser.Game, characterConstructor: any, jobConstructor: any) {
    this.game = game
    this.tintTimer = this.game.time.create(false)
    this.setCharacterData(characterConstructor, jobConstructor)
    this.addAnimations(characterConstructor.atlasKey)
  }

  setCharacterData(characterConstructor: Character.Constructor, jobConstructor: any) {
    this.id = characterConstructor.id
    this.atlasKey = characterConstructor.atlasKey
    this.name = characterConstructor.name
    this.level = characterConstructor.level
    this.status = characterConstructor.status
    this.stats = characterConstructor.stats
    this.ATB = characterConstructor.ATB
    this.items = characterConstructor.items
    this.sprite = this.game.add.sprite(0, 0, characterConstructor.atlasKey, 'stand') 
    this.job = new Job(this.game, jobConstructor)
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
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
        hitAnimation:  new Phaser.Sprite(this.game, 100, 100, 'slash'),
        play: () => {
          return new Promise(resolve => {
            this.game.add.existing(this.animations.attack.hitAnimation)
            this.animations.attack.hitAnimation.animations.add('start')
            this.sprite.animations.play('attack')
            this.sprite.animations.getAnimation('attack').onLoop.add((sprite, animation) => {
              if (animation.loopCount === 1) {
                this.animations.attack.hitAnimation.animations.play('start', 30)
              }
              if (animation.loopCount === 2) {
                this.sprite.animations.stop('attack')
                resolve(true)
              }
            }, this)
          })
        }
      },
      hit: {
        play: () => {
          return new Promise(resolve => {
            const timer = this.game.time.create(false)
            this.sprite.loadTexture(this.sprite.key, 'hit')
            timer.loop(Phaser.Timer.HALF + Phaser.Timer.QUARTER, () => {
              this.resetPosition()
              timer.stop()
              timer.destroy()
              resolve(true)
            })
            timer.start()
          })
        }
      },
      useItem: {
        play: () => {
          return new Promise(resolve => {
            const timer = this.game.time.create(false)
            this.sprite.loadTexture(this.sprite.key, 'item')
            timer.loop(Phaser.Timer.HALF + Phaser.Timer.QUARTER, () => {
              this.resetPosition()
              timer.stop()
              timer.destroy()
              resolve(true)
            })
            timer.start()
          })
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

  generateAttackAnimation(): Promise<any> {
    return new Promise(resolve => {
      this.game.add.existing(this.animations.attack.hitAnimation)
      this.animations.attack.hitAnimation.animations.add('start')
      this.sprite.animations.play('attack')
      this.sprite.animations.getAnimation('attack').onLoop.add((sprite, animation) => {
        if (animation.loopCount === 1) {
          this.animations.attack.hitAnimation.animations.play('start', 30)
        }
        if (animation.loopCount === 2) {
          this.sprite.animations.stop('attack')
          resolve(true)
        }
      }, this)
    })
  }

  setStatus(status: number) {
    this.status = status
  }

  resetATB() {
    this.ATB = 0
  }

  fillATB(): Battle.ReadyCharacter {
    const actionReady = <any>{}
    const ATBData = this.job.fillATB(this)
    this.ATB = ATBData.newATB
    actionReady.idReady = this.ATB === 100 ? this.id : 0
    actionReady.automaticAction = ATBData.returnAction ? ATBData.returnAction : {}
    return actionReady
  }

  async attack(target: Character | Enemy): Promise<boolean> {

    // ------ Llamada (más o menos) con callbacks
    // const callbackArguments = [target, 58]
    // this.goToFront(() => {
    //   this.makeAttackAnimation((target, damage) => {
    //     target.getHit(damage, () => {
    //       this.goToBack()
    //     })
    //   })
    // }, callbackArguments)

    await this.goToFront()
    await this.makeAttackAnimation()
    await target.getHit(58)
    return this.goToBack()
  }

  async specialAttack(target: Character | Enemy): Promise<boolean> {
    return (this.job.performSpecialAttack(this, target))
  }

  async useItem(idItem: number, target: Character | Enemy) {
    await this.goToFront() 
    await this.makeUseItemAnimation()   
    target.restoreHP(50)
    return this.goToBack()    
  }

  victory(): void {
    this.animations.victory.play()
  }

  prepareForAction(): void {
    this.resetATB()
    this.sprite.loadTexture(this.atlasKey, 'defend')
  }

  walkToPosition(position, resetAtEnd?: Boolean): Promise<boolean> {
    return new Promise<any> (resolve => {
      this.animations.walk.play()
      const tween = this.game.add.tween(this.sprite).to({x: position}, 100, "Linear", true)  
      tween.onComplete.add(() => {
        if (resetAtEnd) {
          this.resetPosition()
        }
        resolve(true)
      })
    })
  }

  async goToFront(): Promise<boolean> {
    return (await this.walkToPosition(this.sprite.x - 50))
  }

  async goToBack(): Promise<boolean> {
    this.sprite.scale.x = -SCALE
    return (await this.walkToPosition(this.initialPosition.x, true))
  }

  resetPosition(): void {
    this.sprite.loadTexture(this.atlasKey, 'stand')
    this.sprite.scale.x = SCALE  
  }

  async makeUseItemAnimation(): Promise<boolean> {
    return this.animations.useItem.play()
  }

  async makeAttackAnimation(): Promise<boolean> {
    return this.animations.attack.play()
  }

  async getHit(damage: number): Promise<boolean> {
    BattleMechanics.showDamage(this.game, damage.toString(), this.sprite)
    return this.animations.hit.play()
  }

  restoreHP(amount: number):  Promise<boolean> {
    return BattleMechanics.showRecoveredHP(this.game, amount.toString(), this.sprite)          
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

  async makeAction(command: number, target: Character | Enemy, groupTargets?: any[], idItem?: number): Promise<boolean> {
    let promise: Promise<boolean>
    switch (command) {
      case COMMANDS.FIGHT.ID:
        promise = this.attack(target)
        break
      case COMMANDS.SPECIAL_ATTACK.ID:
        promise = this.specialAttack(target)
        break
      case COMMANDS.ITEM.ID:
        promise = this.useItem(idItem, target)
      default:
        promise = new Promise(resolve => {
          resolve(true)
        })
        break
      }
    return promise
  }  

  getTargetType(command: number) {
    let targetType: number = 0
    switch(command) {
      case COMMANDS.FIGHT.ID:
        targetType = ACTOR_TYPES.ENEMY
        break
      case COMMANDS.ITEM.ID:
        targetType = ACTOR_TYPES.CHARACTER
        break
      case COMMANDS.SPECIAL_ATTACK.ID:
        targetType = ACTOR_TYPES.ENEMY
        break
    }
    return targetType
  }

  focus(): void {
    enum tints  {
      light = 0xffffff,
      dark = 0x918e8c
    }
    let key: boolean = true
    this.tintTimer.loop(Phaser.Timer.QUARTER / 2, () => {
      key = !key
      this.sprite.tint = key ? tints.dark : tints.light
    })
    this.tintTimer.start()
  }

  resetFocus(): void {
    this.tintTimer.stop()
    this.sprite.tint = 0xffffff
  }
  
}