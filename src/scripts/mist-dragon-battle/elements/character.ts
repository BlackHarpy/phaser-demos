import { COMMANDS, INITIAL_MENU_TEXT_POSITION_Y, CHARACTER_STATUS } from './../constants';
'use strict'

import {SCALE} from '../constants'
import Job from '../elements/job'
import Boss from '../elements/boss'

interface IAction {
  executor: string,
  idExec: number,
  idTarget: number,
  idAction: number
}

interface IActionReady {
  idReady: number,
  automaticAction?: IAction
}

interface IStats {
  HP: number,
  MP: number,
  STRENGTH: number,
  SPEED: number,
  STAMINA: number,
  INTELLECT: number,
  SPIRIT: number
}

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
  id: number
  atlasKey: string  
  name: string
  level: number
  status: number
  sprite: Phaser.Sprite
  ATB: number
  stats: IStats
  job: Job
  animations: IAnimations
  initialPosition: IPosition

  constructor(game: Phaser.Game, characterConstructor: any, jobConstructor: any) {
    this.game = game
    this.setCharacterData(characterConstructor, jobConstructor)
    this.addAnimations(characterConstructor.atlasKey)
  }

  setCharacterData(characterConstructor: any, jobConstructor: any) {
    this.id = characterConstructor.id
    this.atlasKey = characterConstructor.atlasKey
    this.name = characterConstructor.name
    this.level = characterConstructor.level
    this.status = characterConstructor.status
    this.stats = characterConstructor.stats
    this.ATB = characterConstructor.ATB
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
        play: () => {
          return new Promise(resolve => {
            this.sprite.animations.play('attack')
            this.sprite.animations.getAnimation('attack').onLoop.add((sprite, animation) => {
              if (animation.loopCount === 2) {
                this.sprite.animations.stop('attack')
                resolve(true)
              }
            }, this)
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

  prepareForAction(): void {
    this.ATB = 0
    this.sprite.loadTexture(this.atlasKey, 'defend')
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

  async makeAction(command: number, target: Boss): Promise<Boolean> {
    let promise: Promise<Boolean>
    switch (command) {
      case COMMANDS.FIGHT.ID:
        promise = this.attack()
        break
      case COMMANDS.SPECIAL_ATTACK.ID:
        this.specialAttack(target)
        break
      }
    return promise
  }

  setStatus(status: number) {
    this.status = status
  }

  async attack(): Promise<Boolean> {
    this.ATB = 0
    await this.goToFront()
    await this.makeAttackAnimation()
    return this.goToBack()
  }

  victory(): void {
    this.animations.victory.play()
  }

  walkToPosition(position, resetAtEnd?: Boolean): Promise<Boolean> {
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
 
  async makeAttackAnimation(): Promise<Boolean> {
    return this.animations.attack.play()
  }

  specialAttack(target: Boss, onEndCallback?) {
    this.job.performSpecialAttack(this, target)
  }

  async goToFront(onEndCallback?: Function, additionalCallback?: Function, character?: Character, target?: Boss): Promise<Boolean> {
    return (await this.walkToPosition(this.sprite.x - 50))
  }

  async goToBack(): Promise<Boolean> {
    this.sprite.scale.x = -SCALE
    return (await this.walkToPosition(this.initialPosition.x, true))
  }

  resetPosition(): void {
    this.sprite.loadTexture(this.atlasKey, 'stand')
    this.sprite.scale.x = SCALE  
  }

  fillATB(): IActionReady {
    const actionReady = <any>{}
    const ATBData = this.job.fillATB(this)
    this.ATB = ATBData.newATB
    actionReady.idReady = this.ATB === 100 ? this.id : 0
    actionReady.automaticAction = ATBData.returnAction ? ATBData.returnAction : {}
    return actionReady
  }
  
}