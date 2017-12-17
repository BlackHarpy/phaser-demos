declare interface IPosition {
  x: number
  y: number
}

declare interface IStats {
  HP: number
  MP: number
  STRENGTH: number
  SPEED: number
  STAMINA: number
  INTELLECT: number
  SPIRIT: number
  ATTACK: number
  ACCURACY: number
  EVASION: number
  DEFENSE: number
  MAGIC_DEFENSE: number
  MAGIC_EVASION: number
}

declare interface ICommand {
  id: number
  method: Function
  hitAnimation?: Phaser.Animation
}

declare namespace Battle {
  interface ActionData {
    executor: string
    idExec: number
    idTarget: number
    idAction: number
  }

  interface ATBData {
    newATB: number
    returnAction?: ActionData
  }

  interface ReadyCharacter {
    idReady: number
    automaticAction?: ActionData
  }

  interface Target {
    type: string
    object: Enemy.Base | Character.Base
  }
}

declare namespace Job {
  interface Base {
    specialAttack: SpecialAttack
    fillATB: Function
    performSpecialAttack?: Function
  }

  interface SpecialAttack {
    key: string
    name: string
    chargeTime?: number
    perform?: Function
  }
}

declare namespace Character {

  interface Base {
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
    animations: Animations
    initialPosition: IPosition
    tintTimer: Phaser.Timer
  }

  interface AnimationData {
    play(damage?: number)    
    animation?: Phaser.Animation
    hitAnimation?: Phaser.Sprite
  }

  interface Animations {
    walk: AnimationData
    attack?: AnimationData
    hit?: AnimationData
    victory?: AnimationData
  }
}

declare namespace Enemy {
  interface Base {
    game: Phaser.Game
    id: number
    atlasKey: string
    name: string
    level: number
    status: number
    sprite: Phaser.Sprite
    ATB: number
    stats: IStats
    commands: ICommand[]
    customFlags?: object    
  }
}

declare namespace Item {
  interface Base {
    id: number
    type: number
    name: string
    menuSprite: Phaser.Sprite
  }
}

declare namespace Weapon {
  interface Base extends Item.Base {
    sprite: Phaser.Sprite
    stats: WeaponStats
  }

  interface WeaponStats {
    attack: number
    accuracy: number
  }
}

declare namespace Armor {
  interface Base extends Item.Base {
    sprite: Phaser.Sprite
    stats: ArmorStats
  }

  interface ArmorStats {
    defense: number
    magicDefense: number
    evasion: number
    magicEvasion
  }
}

declare namespace BattleMenu {
  interface Cursor {
    sprite: Phaser.Sprite
    currentOption: number
  }

  interface MenuPoint {
    x: number
    y: number
  }

  interface MenuSize {
    width: number
    height: number
  }

  interface BackgroundConfig {
    position: MenuPoint
    anchor: MenuPoint
    size: MenuSize
  }

  interface CharacterMenuInfo {
    id: number
    name: Phaser.Text
    healthInfo: Phaser.Text
    initiativeBar?: Phaser.Sprite //no idea yet
  }

  interface EnemyMenuInfo {
    id: number
    name: Phaser.Text
  }

  interface CommandsMenuInfo {
    id: number
    name: Phaser.Text
    position: string
    cursorPosition?: MenuPoint
  }

  interface CharactersMenuSection {
    background: Phaser.Sprite
    charactersList: CharacterMenuInfo[]
  }

  interface EnemiesMenuSection {
    background: Phaser.Sprite
    enemiesList: EnemyMenuInfo[]
  }

  interface CommandsMenuSection {
    background: Phaser.Sprite
    commandsList: CommandsMenuInfo[]
  }

  interface CharacterData {
    id: number
    name: string
    specialAttack: string
    items?: string[]
    totalHealth?: number
    remainingHealth?: number
    cursorPosition?: MenuPoint
  }

  interface EnemyData {
    id: number
    name: string
    cursorPosition?: MenuPoint
  }

  interface MenuData {
    characters: CharacterData[]
    enemies: EnemyData[]
  }
}
















