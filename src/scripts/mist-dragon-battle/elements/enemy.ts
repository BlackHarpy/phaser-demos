'use strict'

import { ACTOR_TYPES, MENU_HEIGHT } from './../constants';
import { Character } from './character'
import{ BattleMechanics } from './battle-mechanics'
import {SCALE} from '../constants'

interface ITransformation {
  id: number,
  key: string
}

export class Enemy implements Enemy.Base {
  game: Phaser.Game
  id: number  
  atlasKey: string
  sprite: Phaser.Sprite  
  name: string
  level: number
  status: number
  stats: IStats
  ATB: number
  customFlags: Enemy.CustomFlag[]
  commands: ICommand[]

  constructor(game: Phaser.Game, enemyConstructor: Enemy.Constructor) {
    this.game = game
    this.id = enemyConstructor.id
    this.sprite = this.setSprite(enemyConstructor.atlasKey)
    this.name = enemyConstructor.name
    this.level = enemyConstructor.level
    this.status = enemyConstructor.status
    this.stats = enemyConstructor.stats
    this.ATB = enemyConstructor.ATB
    this.commands = enemyConstructor.commands
    this.customFlags = enemyConstructor.customFlags
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

  fillATB(availableTargets: number[]): Battle.ReadyCharacter {
    const actionReady = <any>{}
    const ATBData = this.getAutomaticAction(availableTargets)
    this.ATB = ATBData.newATB
    actionReady.idReady = this.ATB === 100 ? this.id : 0
    actionReady.automaticAction = ATBData.returnAction ? ATBData.returnAction : {}
    return actionReady 
  }

  getAutomaticAction(availableTargets: number[]) {
    const ATBData = <any>{}
    ATBData.newATB = this.ATB + this.stats.SPEED > 100 ? 100 : this.ATB + this.stats.SPEED
    if (ATBData.newATB === 100) {
      const nextCommand = this.getNextCommand(availableTargets)
      ATBData.returnAction = {
        executor: ACTOR_TYPES.ENEMY,
        idExec: this.id,
        idTarget: nextCommand.idTarget,
        idAction: nextCommand.idAction
      }
    }
    return ATBData
  }
  
  getNextCommand(availableTargets: number[]) {
    const nextAction: any = {}
    if (availableTargets.length) {
      const targetIndex = Math.floor(Math.random() * availableTargets.length)
      nextAction.idTarget = availableTargets[targetIndex]
      nextAction.idAction = 1
    } else {
      nextAction.idAction = 0
      nextAction.idTarget = 0
    }
    return nextAction
  }

  makeAction(command: number, target: Character | Enemy) {
    let promise: Promise<boolean>
    switch (command) {
      case 1:
        promise = this.attack(target)
        break
    }
    return promise
  }

  async attack(target: Character | Enemy): Promise<boolean> {
    this.ATB = 0    
    await this.blink()
    return target.getHit(10)
  }

  getHit(damage: number): Promise<boolean> {
    return new Promise(resolve => {
      BattleMechanics.showDamage(this.game, damage.toString(), this.sprite)      
      resolve(true)
    })
  }

  blink(): Promise<boolean> {
    return new Promise(resolve => {
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
          resolve (true)
        }
      })
      tintTimer.start()
    })
  }
  

}