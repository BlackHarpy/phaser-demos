import { COMMANDS, INITIAL_MENU_TEXT_POSITION_Y, CHARACTER_STATUS, ACTOR_TYPES } from './../constants'
import { SCALE } from '../constants'
import { Job } from '../elements/job'
import { Enemy } from '../elements/enemy'
import { Item } from './item'
import { Equipment } from './equipment'
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
  currentStats: IStats
  job: Job.Base
  inventory: Character.InventoryItem[]
  equipment: Equipment[]
  animations: Character.Animations
  initialPosition: IPosition
  tintTimer: Phaser.Timer

  constructor(game: Phaser.Game, characterConstructor: any, jobConstructor: any, inventory: Character.InventoryItem[], equipment: Equipment[]) {
    this.game = game
    this.tintTimer = this.game.time.create(false)
    this.setCharacterData(characterConstructor, jobConstructor, inventory, equipment)
    this.addAnimations(characterConstructor.atlasKey)
  }

  setCharacterData(characterConstructor: Character.Constructor, jobConstructor: any, inventory: Character.InventoryItem[], equipment: Equipment[]) {
    this.id = characterConstructor.id
    this.atlasKey = characterConstructor.atlasKey
    this.name = characterConstructor.name
    this.level = characterConstructor.level
    this.status = characterConstructor.status
    this.stats = characterConstructor.stats
    this.currentStats = {...characterConstructor.stats}
    this.ATB = characterConstructor.ATB
    this.inventory = inventory
    this.equipment = equipment
    this.sprite = this.game.add.sprite(0, 0, characterConstructor.atlasKey, 'stand')
    this.job = new Job(this.game, jobConstructor)
    this.sprite.scale.setTo(SCALE)
    this.sprite.smoothed = false
    this.sprite.anchor.set(0.5, 0.5)
  }

  setItems(inventory: Character.InventoryItem[]) {
    this.inventory = inventory
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
        hitAnimation: new Phaser.Sprite(this.game, 100, 100, 'slash'),
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
      defend: {
        play: () => {
          return new Promise(resolve => {
            this.sprite.loadTexture(this.sprite.key, 'defend')
            resolve(true)
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

  async attack(target: Character | Enemy): Promise<Battle.ActionStatus> {

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
    const damage = BattleMechanics.calculateDamage(this, target, COMMANDS.FIGHT.ID)
    await this.goToBack()
    const newStatus = {
      targets: [{
        type: ACTOR_TYPES.ENEMY,
        id: target.id,
        newHP: await target.getHit(damage)
      }]
    }
    return {
      response: 'OK',
      newStatus
    }
  }

  async specialAttack(target: Character | Enemy): Promise<Battle.ActionStatus> {
    
    const attackResult = await this.job.performSpecialAttack(this, target)
    const newStatus = {
      character: {
        id: this.id,
        newHP: attackResult.hpLoss
      },
      targets: [{
        type: ACTOR_TYPES.ENEMY,        
        id: target.id,
        newHP: attackResult.damage === 0 ? target.currentStats.HP : await target.getHit(attackResult.damage)
      }]
    }

    return {
      response: 'OK',
      newStatus
    }
  }

  async useItem(idItem: number, target: Character | Enemy): Promise<Battle.ActionStatus> {
    await this.goToFront()
    await this.makeUseItemAnimation()
    const newStatus = this.consumeRecoveryItem(idItem, target)
    await this.goToBack()
    return {
      response: 'OK',
      newStatus
    }
  }

  async defend(): Promise<Battle.ActionStatus> {
    await this.animations.defend.play()
    return {
      response: 'OK',
      newStatus: {
        character: {
          id: this.id,
          newStatus: CHARACTER_STATUS.DEFEND
        }
      }
    }
  }

  consumeRecoveryItem(idItem: number, target: Character | Enemy) {
    const inventoryRecord = this.inventory.find(itemRecord => {
      return itemRecord.item.id === idItem
    })
    if (inventoryRecord.remaining === 1) {
      const indexToDelete = this.inventory.findIndex(record => {
        return record.item.id === inventoryRecord.item.id
      })
      this.inventory.splice(indexToDelete, 1)
    } else {
      inventoryRecord.remaining--
    }
    return {
      character: {
        id: this.id,
        newInventory: this.inventory
      },
      targets: [{
        type: ACTOR_TYPES.CHARACTER,        
        id: target.id,
        newHP: target.restoreHP(inventoryRecord.item.modifier)
      }]
    }
  }

  victory(): void {
    this.animations.victory.play()
  }

  prepareForAction(): void {
    this.resetATB()
    this.sprite.loadTexture(this.atlasKey, 'defend')
  }

  walkToPosition(position, resetAtEnd?: Boolean): Promise<boolean> {
    return new Promise<any>(resolve => {
      this.animations.walk.play()
      const tween = this.game.add.tween(this.sprite).to({ x: position }, 100, "Linear", true)
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
    const textureKey = this.status === CHARACTER_STATUS.DEFEND ? 'defend' : 'stand'
    this.sprite.loadTexture(this.atlasKey, textureKey)
    this.sprite.scale.x = SCALE
  }

  async makeUseItemAnimation(): Promise<boolean> {
    return this.animations.useItem.play()
  }

  async makeAttackAnimation(): Promise<boolean> {
    return this.animations.attack.play()
  }

  async getHit(damage: number): Promise<number> {
    BattleMechanics.showDamage(this.game, damage.toString(), this.sprite)
    await this.animations.hit.play()
    return this.currentStats.HP - damage >= 0 ? this.currentStats.HP - damage  : 0
  }

  restoreHP(amount: number): number {
    BattleMechanics.showRecoveredHP(this.game, amount.toString(), this.sprite)
    return this.currentStats.HP + amount <= this.stats.HP ? this.currentStats.HP + amount : this.stats.HP
  }

  setToBattle(referenceHeight: number, partySize: number, position: number): void {
    this.sprite.x = this.game.world.width
    this.game.add.tween(this.sprite).to({ x: this.game.world.centerX * SCALE }, 100, Phaser.Easing.Linear.None, true)
    this.sprite.y = referenceHeight / (partySize + 1) * (position + 1)
    this.initialPosition = {
      x: this.game.world.centerX * SCALE,
      y: this.sprite.y
    }
  }

  async makeAction(command: number, target: Character | Enemy, groupTargets?: any[], idItem?: number): Promise<Battle.ActionStatus> {
    let promise: Promise<Battle.ActionStatus>
    switch (command) {
      case COMMANDS.FIGHT.ID:
        promise = this.attack(target)
        break
      case COMMANDS.SPECIAL_ATTACK.ID:
        promise = this.specialAttack(target)
        break
      case COMMANDS.ITEM.ID:
        promise = this.useItem(idItem, target)
        break
      case COMMANDS.DEFEND.ID:
        promise = this.defend()
      // default:
      //   promise = new Promise(resolve => {
      //     resolve(true)
      //   })
      //   break
    }
    return promise
  }

  getTargetType(command: number) {
    let targetType: number = 0
    switch (command) {
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
    enum tints {
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