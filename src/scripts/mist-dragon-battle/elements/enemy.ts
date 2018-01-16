import { ACTOR_TYPES, MENU_HEIGHT, COMMANDS } from './../constants';
import { Character } from './character'
import{ BattleMechanics } from './battle-mechanics'
import {SCALE} from '../constants'
import { networkInterfaces } from 'os';

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
  equipment: any[]    //wont use this
  currentStats: IStats
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
    this.currentStats = {...enemyConstructor.stats}
    this.ATB = enemyConstructor.ATB
    this.commands = enemyConstructor.commands
    this.customFlags = enemyConstructor.customFlags
    this.equipment = []
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
      // nextAction.idTarget = 100
      // nextAction.idAction = 2
      const targetIndex = Math.floor(Math.random() * availableTargets.length)
      nextAction.idTarget = availableTargets[targetIndex]
      nextAction.idAction = 1
    } else {
      nextAction.idAction = 0
      nextAction.idTarget = 0
    }
    return nextAction
  }

  makeAction(command: number, target?: Character | Enemy, groupTargets?: any[], idItem?: number): Promise<Battle.ActionStatus> {
    let promise: Promise<Battle.ActionStatus>
    switch (command) {
      case 1:
        promise = this.attack(target)
        break
      case 2:
        promise = this.specialAttack(groupTargets)
        break

    }
    return promise
  }

  async attack(target: Character | Enemy): Promise<Battle.ActionStatus> {
    this.ATB = 0    
    await this.blink()
    const damage = BattleMechanics.calculateDamage(this, target, COMMANDS.FIGHT.ID)
    const newStatus = {
      targets: [{
        type: ACTOR_TYPES.CHARACTER,
        id: target.id,
        newHP: await target.getHit(damage)
      }]
    }
    
    return {
      response: 'OK',
      newStatus
    }
  }

 //TODO Check this next
  async specialAttack(groupTargets: Character[]): Promise<Battle.ActionStatus> {
    let promise: Promise<Battle.ActionStatus>
    this.ATB = 0        
    await this.blink()
    const newStatus = {}    
    groupTargets.forEach(character => {
      character.getHit(50)
    })
    return {
      response: 'OK',
      newStatus
    }
  }

  async getHit(damage: number): Promise<number> {
    await BattleMechanics.showDamage(this.game, damage.toString(), this.sprite)      
    return  this.currentStats.HP - damage >= 0 ? this.currentStats.HP - damage  : 0
  }

  restoreHP(amount: number) {
    BattleMechanics.showDamage(this.game, amount.toString(), this.sprite)
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