import { Equipment } from './equipment';
import { Character } from './character'
import { Enemy } from './enemy'
import { COMMANDS, CHARACTER_STATUS, ITEM_TYPES } from './../constants'

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function numbersBounce (game: Phaser.Game, number: string, sprite: Phaser.Sprite, tint: number): Promise<boolean> {
  return new Promise (resolve => {
    const num: string[] = number.split('')
    const damageText: Phaser.BitmapText[] = []
    let x: number = sprite.centerX - (10 * num.length)
    num.forEach((digit, index) => {
      const digitText = new Phaser.BitmapText(game, x, sprite.centerY, 'ffNumbers', digit, 20)
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

function getWeaponStat(attackerEquipment: Equipment[], stat: string) {
  const weapon: any = attackerEquipment.find(equipment => {
    return equipment.type === ITEM_TYPES.WEAPON
  })
  return weapon.stats[stat] ? weapon.stats[stat] : 0
}

function getArmorStat(attackerEquipment: Equipment[], stat: string) {
  const armorList: any[] = attackerEquipment.filter(equipment => {
    return equipment.type === ITEM_TYPES.ARMOR
  })
  const statSum = armorList.reduce((previous, current) => {
    return previous + current.stats[stat]
  }, 0)
  return statSum <= 0 ? 0 : statSum
}

function calculateBaseAttackPower(attacker: Character | Enemy): number {
  let baseAttackPower: number = 0
  if (attacker instanceof Character) {
    baseAttackPower = Math.round(getWeaponStat(attacker.equipment, 'ATTACK') + attacker.currentStats.STRENGTH / 4 + attacker.level / 4)
  } 
  if (attacker instanceof Enemy) {
    baseAttackPower = attacker.currentStats.STRENGTH
  }
  return baseAttackPower
}

function calculateBaseDefense(target: Character | Enemy): number {
  let baseDefense: number = 0
  if (target instanceof Character) {
    baseDefense = Math.round(getArmorStat(target.equipment, 'DEFENSE') + target.currentStats.STAMINA / 2)
  } 
  if (target instanceof Enemy) {
    baseDefense = target.currentStats.DEFENSE
  }
  if (target.status === CHARACTER_STATUS.DEFEND) {
    baseDefense = baseDefense * 2
  }
  return baseDefense
}

function calculateBaseMagicDefense(target: Character | Enemy): number {
  let baseMagicDefense: number = 0
  if (target instanceof Character) {
    baseMagicDefense = getArmorStat(target.equipment, 'MAGIC_DEFENSE')
  } 
  if (target instanceof Enemy) {
    baseMagicDefense = target.currentStats.MAGIC_DEFENSE
  }
  return baseMagicDefense
}


function calculateEvadeRate(target: Character | Enemy): number {
  let evadeRate = 0
  if (target instanceof Character) {
    evadeRate = getArmorStat(target.equipment, 'EVADE')
  }
  return evadeRate
}

function calculateDefenseMultiplier(target: Character | Enemy): number {
  let defenseMultiplier: number = 0
  if (target instanceof Character) {
    defenseMultiplier = Math.round(target.currentStats.SPEED / 8 + target.level / 16)
  }
  return defenseMultiplier
}

function evadeHit(evadeRate: number, defenseMultiplier: number): boolean {
  let evasionSuccess: boolean = false
  for(let j = 0; j < defenseMultiplier; j++) {
    if (!evasionSuccess) {
      if (getRandomInt(0, 99) < evadeRate) {
        evasionSuccess = true
      }
      3.2
    }
  }
  return evasionSuccess
}

function calculateHitDamage(attackPower: number, targetDefense: number, attackMultiplier: number): number {
  let hitDamage: number = Math.round((attackPower * getRandomInt(100, 150))/100 - targetDefense)
  hitDamage = hitDamage < 0 ? 0 : hitDamage
  return attackMultiplier > 0 && hitDamage === 0 ? 1 : hitDamage
}


function calculateTotalHitsDamage(attackPower: number, hitRate: number, attackMultiplier: number, defense: number, evadeRate: number, defenseMultiplier: number): number {
  let damage: number = 0
  let miss: boolean = true
  if (attackMultiplier >= 1) {
    for (let i = 0; i < attackMultiplier; i++) {
      if (getRandomInt(0, 99) <= hitRate) {
        miss = false
        if (!evadeHit(evadeRate, defenseMultiplier)) {
          damage += calculateHitDamage(attackPower, defense, attackMultiplier)
        }
      }
    }
  }
  return miss ? -1 : damage
}

function calculateCriticalHitModifier(attacker: Character | Enemy): number {
  let modifier: number = 0
  if (attacker instanceof Character) {
    //Successful Critical Hit
    if (getRandomInt(1, 32) === 1) {
      modifier = Math.round(getWeaponStat(attacker.equipment, 'ATTACK') / 2)
    }
  }
  return modifier
}

function calculateHitRate(attacker: Character | Enemy): number {
  let hitRate: number
  if (attacker instanceof Character) {
    hitRate = getWeaponStat(attacker.equipment, 'ACCURACY') + attacker.level / 4
  } else {
    //Monstaaaaaa
    hitRate = 70 + attacker.level / 4
  }
  return Math.round(hitRate)
}

function calculateAttackMultiplier(attacker: Character | Enemy): number {
  return Math.round(attacker.currentStats.STRENGTH / 8 + attacker.currentStats.SPEED / 16 + 1)

}

function calculateRegularDamage(attacker: Character | Enemy, target: Character | Enemy): number {
  const baseAttackPower: number = calculateBaseAttackPower(attacker)
  const attackPower: number = baseAttackPower + calculateCriticalHitModifier(attacker)
  const hitRate: number = calculateHitRate(attacker)
  const attackMultiplier: number = calculateAttackMultiplier(attacker)

  const baseDefense = calculateBaseDefense(target)
  const baseEvade = calculateEvadeRate(target)
  const defenseModifier = calculateDefenseMultiplier(target)
  return calculateTotalHitsDamage(attackPower, hitRate, attackMultiplier, baseDefense, baseEvade, defenseModifier)
}


function calculateSpecialAttackDamage(attacker: Character | Enemy, target: Character | Enemy, attackKey: string): number {
  const baseAttackPower: number = calculateBaseAttackPower(attacker)
  const attackPower: number = baseAttackPower + calculateCriticalHitModifier(attacker)
  const attackMultiplier: number = calculateAttackMultiplier(attacker)
  const specialAttackCalculations = {
    darkness: () => {
      const damage = (attackMultiplier * attackPower * 1/2)
      return damage + ((damage * getRandomInt(100, 150)/100) % 256)
    },
    jump: () => {
      const hitRate: number = calculateHitRate(attacker)
      const modifiedAttackPower = attackPower * 2
      const baseDefense = calculateBaseDefense(target)
      const baseEvade = calculateEvadeRate(target)
      const defenseModifier = calculateDefenseMultiplier(target)
      return calculateTotalHitsDamage(modifiedAttackPower, hitRate, attackMultiplier, baseDefense, baseEvade, defenseModifier)
    },
    freezingMist: () => {
      const spellPower: number = 8
      const spellMultiplier: number = Math.round(attacker.currentStats.SPIRIT / 4 + 1)
      const magicDefense = calculateBaseMagicDefense(target)
      let damage: number = 0
      for(let i = 0; i < spellMultiplier; i++) {
        //Caster's Spell Power * random(100, 150)/100 - Target's Magic Defense
       damage += calculateHitDamage(spellPower, magicDefense, spellMultiplier)
      }
      return damage
    }
  }

  return Math.round(specialAttackCalculations[attackKey]())
}

export class BattleMechanics {

  static setInitialATB(party: Character[]): Character[] {
    return party.map(character => {
      character.ATB = getRandomInt(0, 50)
      return character
    })
  }

  static getAvailableForTargeting(party: Character[]): number[] {

    return party.filter(target => {
      if (target.status !== CHARACTER_STATUS.JUMP && target.status !== CHARACTER_STATUS.KO) {
        return target.id
      }
    }).map(character => { return character.id })
  }

  static calculateDamage(attacker: Character | Enemy, target: Character | Enemy, action: number, specialAttackKey?: string): number {
    const damageCalculationObject = {
      [COMMANDS.FIGHT.ID]: calculateRegularDamage,
      [COMMANDS.SPECIAL_ATTACK.ID]: calculateSpecialAttackDamage
    }
    let damage: number = -1
    if (target.status !== CHARACTER_STATUS.MIST) {
      damage = damageCalculationObject[action](attacker, target, specialAttackKey)
    }
    return damage
  }

  static showDamage(game: Phaser.Game, damage: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, damage !== '-1' ? damage : 'miss!', sprite, 0xFFFFFF)
  }

  static showRecoveredHP(game: Phaser.Game, recovered: string, sprite: Phaser.Sprite): Promise<boolean> {
    return numbersBounce(game, recovered, sprite, 0x50d424)
  }

  static showMessage(game: Phaser.Game, text: string, seconds?: number): Promise<boolean> {
    return new Promise(resolve => {
      const time = seconds ? seconds : 4
      const textStyle: Phaser.PhaserTextStyle = {
        font: "22px Courier", fill: "#fff", strokeThickness: 4
      }
      const background: Phaser.Sprite = game.add.sprite(0, 0, 'rectangle')
      const message: Phaser.Text = game.add.text(65, 18, text, textStyle)
      const destroyMessage = () => {
        background.destroy()
        message.destroy()
        resolve(true)
      }
      background.anchor.x = 0.5
      background.position.set(game.world.centerX, 10)
      background.height = 40
      background.width = game.world.width - 100
  
      game.time.events.add(Phaser.Timer.SECOND * time, destroyMessage, this)
    })
  }

  static getRandomInt(min, max): number {
    return getRandomInt(min,max)
  }

}