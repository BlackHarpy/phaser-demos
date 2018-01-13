import { Equipment } from './equipment';
import { Character } from './character'
import { Enemy } from './enemy'
import { COMMANDS, CHARACTER_STATUS, ITEM_TYPES } from './../constants'

function numbersBounce (game: Phaser.Game, number: string, sprite: Phaser.Sprite, tint: number): Promise<boolean> {
  return new Promise (resolve => {
    const num: string[] = number.split('')
    const damageText: Phaser.BitmapText[] = []
    let x: number = sprite.centerX - (10 * num.length)
    num.forEach((digit, index) => {
      const digitText = new Phaser.BitmapText(game, x, sprite.centerY, 'ffNumbers', digit, 25)
      digitText.tint = tint
      damageText.push(digitText)
      game.add.existing(damageText[index])
      game.add.tween(damageText[index]).to({ y: sprite.centerY - 150 }, 500, Phaser.Easing.Linear.None, true, 100 * index, 0)
      game.add.tween(damageText[index]).to({ y: sprite.centerY + 50 }, 500, Phaser.Easing.Bounce.Out, true,  100 * index, 0).onComplete.add(() => {
        if (index === damageText.length - 1) {
          damageText.forEach(digit => {
            digit.destroy()
          })
          resolve(true)
        }
      })
      x += 20
    })
  })
}

function getWeaponAttackPower(attackerEquipment: Equipment[]) {
  const weapon: any = attackerEquipment.find(equipment => {
    return equipment.type === ITEM_TYPES.WEAPON
  })
  return weapon.stats.ATTACK ? weapon.stats.ATTACK : 0
}

function getWeaponAccuracy(attackerEquipment: Equipment[]) {
  const weapon: any = attackerEquipment.find(equipment => {
    return equipment.type === ITEM_TYPES.WEAPON
  })
  return weapon.stats.ACCURACY ? weapon.stats.ACCURACY : 0
}

function getArmorDefense(attackerEquipment: Equipment[]) {
  const weapon: any = attackerEquipment.find(equipment => {
    return equipment.type === ITEM_TYPES.ARMOR
  })
  return weapon.stats.DEFENSE ? weapon.stats.DEFENSE : 0
}

function calculateBaseAttackPower(attacker: Character | Enemy): number {
  let baseAttackPower: number = 0
  if (attacker instanceof Character) {
    baseAttackPower = getWeaponAttackPower(attacker.equipment) + attacker.currentStats.STRENGTH / 4 + attacker.level / 4
  } 
  if (attacker instanceof Enemy) {
    baseAttackPower = attacker.currentStats.STRENGTH
  }
  return baseAttackPower
}

function calculateBaseDefense(target: Character | Enemy): number {
  let baseDefense: number = 0
  if (target instanceof Character) {
    baseDefense = getArmorDefense(target.equipment) + target.currentStats.STAMINA / 2
  } 
  if (target instanceof Enemy) {
    baseDefense = target.currentStats.DEFENSE
  }
  return baseDefense
}

function calculateBaseEvade(target: Character | Enemy): number {
  if (target instanceof Enemy) {
    return 0
  }
}

function calculateDefenseModifier(target: Character | Enemy): number {
  if (target instanceof Enemy) {
    return 0
  }
}

function calculateRegularDamage(attacker: Character | Enemy, target: Character | Enemy): number {
  const baseAttackPower: number = Math.round(calculateBaseAttackPower(attacker))
  const attackPower: number = baseAttackPower + getWeaponAttackPower(attacker.equipment)
  const baseHitRate: number = Math.round(getWeaponAccuracy(attacker.equipment) + attacker.level / 4)
  const baseAttackMultiplier: number = Math.round(attacker.currentStats.STRENGTH / 8 + attacker.currentStats.SPEED / 16 + 1)

  //only for monsters
  const baseDefense = target.currentStats.DEFENSE
  const baseEvade = calculateBaseEvade(target)
  const defenseModifier = calculateDefenseModifier(target)
  console.log(baseAttackMultiplier)
  return 45
}

export class BattleMechanics {

  static setInitialATB(party: Character[]): Character[] {
    return party.map(character => {
      character.ATB = Math.floor(Math.random() * 101)
      return character
    })
  }

  static getAvailableForTargeting(party: Character[]): number[] {

    return party.filter(target => {
      if (target.status !== CHARACTER_STATUS.JUMP) {
        return target.id
      }
    }).map(character => { return character.id })
  }

  static calculateDamage(attacker: Character | Enemy, target: Character | Enemy, action: number): number {
    const damageCalculationObject = {
      [COMMANDS.FIGHT.ID]: calculateRegularDamage
    }
   
    return damageCalculationObject[action](attacker, target)
  }

  static showDamage(game: Phaser.Game, damage: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, damage, sprite, 0xFFFFFF)
  }

  static showRecoveredHP(game: Phaser.Game, recovered: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, recovered, sprite, 0x50d424)
  }

}