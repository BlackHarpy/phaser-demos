import { ACTOR_TYPES, MENU_HEIGHT, COMMANDS, CHARACTER_STATUS, SCALE } from './../constants';
import { Character } from './character'
import { BattleMechanics } from './battle-mechanics'
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

  constructor(game: Phaser.Game, enemyConstructor: Enemy.Constructor) {
    this.game = game
    this.id = enemyConstructor.id
    this.sprite = this.setSprite(enemyConstructor.atlasKey)
    this.name = enemyConstructor.name
    this.level = enemyConstructor.level
    this.status = enemyConstructor.status
    this.stats = enemyConstructor.stats
    this.currentStats = { ...enemyConstructor.stats }
    this.ATB = enemyConstructor.ATB
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
    this.game.add.tween(this.sprite).to({ x: referenceCenterX / 2 }, 100, Phaser.Easing.Linear.None, true);
  }

  fillATB(availableTargets: number[]): Battle.ReadyCharacter {
    const actionReady = <any>{}
    const ATBData = this.getAutomaticAction(availableTargets)
    this.ATB = ATBData.newATB
    actionReady.idReady = this.ATB === 100 ? this.id : 0
    actionReady.automaticAction = ATBData.returnAction && ATBData.returnAction.idAction !== 0 ? ATBData.returnAction : {}
    return actionReady
  }

  async setStatus(status: number): Promise<boolean> {
    this.status = status
    let finished: boolean = true
    if (status === CHARACTER_STATUS.KO) {
      finished = await this.destroyAnimation()
    }
    return finished
  }

  getAutomaticAction(availableTargets: number[]) {
    const ATBData = <any>{}
    const currentSpeed: number = this.status === CHARACTER_STATUS.MIST ? Math.round(this.currentStats.SPEED / 2) : this.currentStats.SPEED
    ATBData.newATB = this.ATB + currentSpeed > 100 ? 100 : this.ATB + currentSpeed
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
    if (availableTargets.length > 0) {
      // nextAction.idTarget = 100
      // nextAction.idAction = 2
      nextAction.idAction = this.getCommand()
      nextAction.idTarget = this.getTarget(nextAction.idAction, availableTargets)
    } else {
      nextAction.idAction = 0
      nextAction.idTarget = 0
    }
    return nextAction
  }

  getTarget(action: number, availableTargets: number[]): number {
    const targetHandler = {
      [COMMANDS.FIGHT.ID]: () => {
        const targetIndex = BattleMechanics.getRandomInt(0, availableTargets.length - 1)
        return availableTargets[targetIndex]
      },
      [COMMANDS.SPECIAL_ATTACK.ID]: () => {
        //all targets
        return 100
      },
      [COMMANDS.TRANSFORM.ID]: () => {
        return 0
      }
    }
    return targetHandler[action]()
  }

  getCustomFlagValue(key: string): boolean {
    const customFlag = this.customFlags.find(flag => {
      return flag.key === key
    })
    return customFlag ? customFlag.active : false
  }

  setCustomFlagValue(key: string): void {
    const index = this.customFlags.findIndex(flag => {
      return flag.key === key
    })
    if (index !== -1) {
      this.customFlags[index].active = false
    }
  }

  getCommand(): number {
    const commandHandler = {
      [CHARACTER_STATUS.NORMAL]: () => {
        //transform if HP is less than half
        let action: number = COMMANDS.FIGHT.ID
        if (this.currentStats.HP < (this.stats.HP / 2)) {
          if (BattleMechanics.getRandomInt(0, 100) < 50) {
            action = COMMANDS.TRANSFORM.ID
          }
        }
        return action
      },
      [CHARACTER_STATUS.MIST]: () => {
        let action: number = COMMANDS.TRANSFORM.ID
        //check if has been attacked while Mist Status
        if (this.getCustomFlagValue('hitWhileMist')) {
          action = COMMANDS.SPECIAL_ATTACK.ID
        }
        return action
      },
      [CHARACTER_STATUS.KO]: () => {
        return 0
      }
    }
    return commandHandler[this.status]()
  }

  makeAction(command: number, target?: Character | Enemy, groupTargets?: any[], idItem?: number): Promise<Battle.ActionStatus> {
    const commandsHandler = {
      [COMMANDS.FIGHT.ID]: () => {
        return this.attack(target)
      },
      [COMMANDS.SPECIAL_ATTACK.ID]: () => {
        return this.specialAttack(groupTargets)
      },
      [COMMANDS.TRANSFORM.ID]: () => {
        return this.transform()
      }
    }
    return commandsHandler[command]()
  }

  async attack(target: Character | Enemy): Promise<Battle.ActionStatus> {
    this.ATB = 0
    await this.blink()
    const damage = BattleMechanics.calculateDamage(this, target, COMMANDS.FIGHT.ID)
    const attackResult = await target.getHit(damage)
    const newStatus = {
      targets: [{
        type: ACTOR_TYPES.CHARACTER,
        id: target.id,
        newHP: attackResult.currentHP,
        status: attackResult.currentHP !== 0 ? CHARACTER_STATUS.NORMAL : CHARACTER_STATUS.KO
      }]
    }
    return {
      response: 'OK',
      newStatus
    }
  }

  //TODO Check this next
  async specialAttack(groupTargets: Character[]): Promise<Battle.ActionStatus> {
    this.ATB = 0
    await this.blink()
    await BattleMechanics.showMessage(this.game, 'Freezing Mist', 1)
    await this.frezingMistAnimation()
    const newStatus = {
      targets: []
    }
    const damagePromises = {
      idCharacters: [],
      promises: []
    }
    groupTargets.forEach(character => {
      const damage = BattleMechanics.calculateDamage(this, character, COMMANDS.SPECIAL_ATTACK.ID, 'freezingMist')
      damagePromises.idCharacters.push(character.id)
      damagePromises.promises.push(character.getHit(damage))
    })
    await Promise.all(damagePromises.promises).then(result => {
      result.forEach((value, index) => {
        newStatus.targets.push({
          type: ACTOR_TYPES.CHARACTER,
          id: groupTargets[index].id,
          newHP: result[index].currentHP,
          status: result[index].currentHP !== 0 ? CHARACTER_STATUS.NORMAL : CHARACTER_STATUS.KO
        })
      })
    })
    await BattleMechanics.showMessage(this.game, 'Do no fight now!', 2)    
    await BattleMechanics.showMessage(this.game, 'Fighting when mist will freeze you with Breath!', 2)    
    return {
      response: 'OK',
      newStatus
    }
  }

  async transform(): Promise<Battle.ActionStatus> {
    this.ATB = 0
    const transformMessage = this.status === CHARACTER_STATUS.NORMAL ? 'Turned into mist!' : 'Now! Get ready to fight!'
    await BattleMechanics.showMessage(this.game, transformMessage, 2)
    await this.transformAnimation()
    const newStatus = {
      targets: [{
        type: ACTOR_TYPES.ENEMY,
        id: this.id,
        newHP: this.currentStats.HP,
        status: this.status === CHARACTER_STATUS.NORMAL ? CHARACTER_STATUS.MIST : CHARACTER_STATUS.NORMAL
      }]
    }
    return {
      response: 'OK',
      newStatus
    }
  }

  frezingMistAnimation(): Promise<boolean> {
    return new Promise (resolve => {
      const emitter = this.game.add.emitter(600, 100, 40)
      emitter.height = 600
      emitter.width = 200
      emitter.makeParticles('freezingMist');
      emitter.forEach((singleParticle) => {
        singleParticle.animations.add('start', [2, 3, 4, 5, 6, 5, 4, 3, 2])
        singleParticle.animations.play('start', 25, true, true)
      }, this)
      emitter.setRotation(0, 0)
      emitter.setXSpeed(0, 0)
      emitter.setYSpeed(0,0)
      emitter.gravity.set(0,0)
      emitter.setAlpha(0.8, 0.8)
      emitter.start(false, 2000, 20)
      this.game.time.events.add(2000, () => {
        emitter.destroy()
        resolve(true)
      }, this);
    })
    
  }

  getHit(damage: number): Promise<Battle.HitResult> {
    return new Promise(resolve => {
      BattleMechanics.showDamage(this.game, damage.toString(), this.sprite)
      const counterAttack = {
        executor: ACTOR_TYPES.ENEMY,
        idExec: this.id,
        idTarget: 0,
        idAction: 0
      }
      if (this.status === CHARACTER_STATUS.MIST) {
        counterAttack.idTarget = 100
        counterAttack.idAction = COMMANDS.SPECIAL_ATTACK.ID
      }
      resolve({
        currentHP: this.currentStats.HP - damage >= 0 ? this.currentStats.HP - damage : 0,
        counterAttack: counterAttack
      })
    })
  }

  restoreHP(amount: number) {
    BattleMechanics.showDamage(this.game, amount.toString(), this.sprite)
  }

  transformAnimation(): Promise<boolean> {
    return new Promise(resolve => {
      const transformTimer = this.game.time.create(false)
      enum sprites {
        normal = 'stand0',
        mist = 'stand1'
      }
      let key: boolean = this.sprite.frame.toString() !== 'stand0'
      let loop: number = 0
      transformTimer.loop(Phaser.Timer.QUARTER / 3, () => {
        key = !key
        this.sprite.loadTexture(this.sprite.key, key ? sprites.normal : sprites.mist)
        let scale = key ? SCALE : 1.2
        this.sprite.scale.set(scale)
        loop++
        if (loop === 9) {
          this.sprite.loadTexture(this.sprite.key, this.status === CHARACTER_STATUS.MIST ? sprites.normal : sprites.mist)
          scale = this.status === CHARACTER_STATUS.MIST ? SCALE : 1.2
          this.sprite.scale.set(scale)
          transformTimer.stop()
          transformTimer.destroy()
          resolve(true)
        }
      })
      transformTimer.start()
    })
  }

  blink(): Promise<boolean> {
    return new Promise(resolve => {
      const tintTimer = this.game.time.create(false)
      enum tints {
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
          resolve(true)
        }
      })
      tintTimer.start()
    })
  }

  destroyAnimation(): Promise<boolean> {
    return new Promise(resolve => {
      this.sprite.x = 200
      const shake = this.game.add.tween(this.sprite)
      .to({x: this.sprite.x - 15}, 100, Phaser.Easing.Bounce.InOut, false, 1000, 20, true)
      const fade = this.game.add.tween(this.sprite)
      .to({alpha: 0, tint: 0xff0000}, 3000, Phaser.Easing.Linear.None, false, 1000)
      let loop: number = 0
      const destroyTimer = this.game.time.create(false)
      destroyTimer.loop(Phaser.Timer.SECOND, () => {
        if (loop < 2) {
          this.game.camera.flash(0xFFFFFF, 300)
        }
        loop++
        if (loop === 2) {
          this.game.camera.flash(0xFFFFFF, 300)          
          shake.start()
          fade.onComplete.add(() => {
            destroyTimer.destroy()
            resolve(true)
          })
          fade.start()
        }
      })
      destroyTimer.start()
    })
  }


}