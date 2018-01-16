import { ACTOR_TYPES, COMMANDS, CHARACTER_STATUS } from './../constants'

import { Character } from '../elements/character'
import { Enemy } from '../elements/enemy'
import { BattleMechanics } from '../elements/battle-mechanics'
import { networkInterfaces } from 'os';

export const DRAGOON = {
  name: 'Dragoon',
  specialAttack: {
    key: 'jump',
    name: 'Jump',
    chargeTime: 5,
    jumpTarget: {},
    async perform(character: Character, target: Character | Enemy): Promise<number> {
      let newTargetHP: Promise<number>
      if (character.status === CHARACTER_STATUS.JUMP) {
        newTargetHP = this.finishJump(character)
      } else {
        await character.goToFront()    
        newTargetHP = this.startJump(character, target)    
      }
      return newTargetHP
    },
 
    startJump(character: Character, target: Character | Enemy): Promise<any> {
      character.setStatus(CHARACTER_STATUS.JUMP)      
      return new Promise(resolve => {
        const timer: Phaser.Timer = character.sprite.game.time.create(false)
        character.sprite.loadTexture(character.atlasKey, 'weak')
        timer.loop(Phaser.Timer.QUARTER, () => {
          character.sprite.loadTexture(character.atlasKey, 'item')
          const tween = character.sprite.game.add.tween(character.sprite).to({ y: character.sprite.y - 200, x: character.sprite.x - 50 }, 80, "Linear", true)
          timer.stop()
          this.jumpTarget = target
          resolve({
            damage: 0,
            hpLoss: character.currentStats.HP,
            status: CHARACTER_STATUS.JUMP
          })
          timer.destroy()
        })
        timer.start()
      })
      
    },

    finishJump(character: Character) {
      return new Promise(resolve => {
        character.sprite.position.set(20, 50)
        character.sprite.loadTexture(character.sprite.key, 'jump')
        const hitTween = character.sprite.game.add.tween(character.sprite).to({ y: this.jumpTarget.sprite.centerY, x: this.jumpTarget.sprite.centerX }, 200, "Linear")
        const returnTween = character.sprite.game.add.tween(character.sprite).to({
          x: [400, character.initialPosition.x],
          y: [10, character.initialPosition.y]
        }, 300);
        returnTween.interpolation(function (v, k) {
          return Phaser.Math.bezierInterpolation(v, k);
        })
        returnTween.onComplete.add(() => {
          const damage = BattleMechanics.calculateDamage(character, this.jumpTarget, COMMANDS.SPECIAL_ATTACK.ID, 'jump')          
          BattleMechanics.showDamage(character.game, damage.toString(), this.jumpTarget.sprite)
          character.ATB = 0
          character.status = CHARACTER_STATUS.NORMAL
          character.resetPosition()
          resolve({
            damage: damage,
            hpLoss: character.currentStats.HP,
            status: CHARACTER_STATUS.NORMAL       //Thankfully I'm not handling altered states            
          })
        }, this, 1, character)
        hitTween.chain(returnTween)
        hitTween.start()
      })
      
    } 
  },

  fillATB(character: Character): Battle.ATBData {
    const ATBData = <any>{}
    if (character.status === CHARACTER_STATUS.JUMP) {
      ATBData.newATB = character.ATB + this.specialAttack.chargeTime > 100 ? 100 : character.ATB + this.specialAttack.chargeTime
      if (ATBData.newATB === 100) {
        ATBData.returnAction = {
          executor: ACTOR_TYPES.CHARACTER,
          idExec: character.id,
          idTarget: this.specialAttack.jumpTarget.id,
          idAction: COMMANDS.SPECIAL_ATTACK.ID
        }
      }
    } else {
      ATBData.newATB = character.ATB + character.stats.SPEED > 100 ? 100 : character.ATB + character.stats.SPEED      
    }
    return ATBData
  }
}

export const DARK_KNIGHT = {
  name: 'Dark Knight',
  specialAttack: {
    key: 'darkness',
    name: 'Darkness',
    emmiter: Phaser.EMITTER,
    perform (character: Character, target: Character | Enemy) {
      return new Promise(resolve => {
        const timer = character.game.time.create(false)
        let ready: boolean = false
        character.sprite.loadTexture(character.sprite.key, 'dark1')
        timer.loop(Phaser.Timer.HALF + Phaser.Timer.QUARTER, () => {
          if (!ready) {
            character.sprite.loadTexture(character.sprite.key, 'dark2')      
            ready = true              
          } else {
            timer.stop()            
            this.emitParticles(character).then((value) => {
              const damage = BattleMechanics.calculateDamage(character, target, COMMANDS.SPECIAL_ATTACK.ID, 'darkness')
              BattleMechanics.showDamage(character.game, damage.toString(), target.sprite)
              character.resetPosition()
              resolve({
                damage: damage,
                hpLoss: Math.round(character.currentStats.HP * 1/8),
                status: CHARACTER_STATUS.NORMAL           
              })
            })
          }
        })
        timer.start()
      })
    },

    emitParticles(character: Character) {
      return new Promise (resolve => {
        this.emitter = character.game.add.emitter(character.sprite.x - 70, character.game.world.centerY, 20)
        this.emitter.makeParticles('dark')
        this.emitter.forEach((singleParticle) => {
          singleParticle.animations.add('start', [11, 12, 13, 14, 15, 16, 15, 14, 13, 12, 11])
          singleParticle.animations.play('start', 25, true, true)
        }, this)
        this.emitter.setRotation(0, 90);
        this.emitter.setScale(0.5, 1, 0.5, 1, 6000, Phaser.Easing.Linear.None);
        this.emitter.gravity.set(-1000, -200)
        this.emitter.start(false, 3000, 1);
        character.game.time.events.add(2000, () => {
          this.emitter.destroy()
          resolve(true)
        }, this);
      })  
    }
  },

  fillATB(character: Character): Battle.ATBData {
    const ATBData = <any>{}
    ATBData.newATB = character.ATB + character.stats.SPEED > 100 ? 100 : character.ATB + character.stats.SPEED      
    return ATBData
  }

}