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
    executor: number
    idExec: number
    idTarget: number
    idAction: number
    idItemUsed?: number
  }

  interface ActionStatus {
    response: string
    newStatus: any
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
    currentStats: IStats
    job: Job.Base
    inventory: InventoryItem[]
    equipment: Equipment.Base[]
    animations: Animations
    initialPosition: IPosition
    tintTimer: Phaser.Timer
  }

  interface Constructor {
    id: number
    atlasKey: string
    name: string
    level: number
    status: number
    spriteKey: string
    ATB: number
    stats: IStats
    currentStats: IStats    
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
    useItem?: AnimationData
    defend?: AnimationData
    victory?: AnimationData
  }

  interface InventoryItem {
    item: Item.Base,
    remaining: number
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

  interface Constructor {
    id: number
    atlasKey: string
    name: string
    level: number
    status: number
    ATB: number
    stats: IStats
    commands: ICommand[]
    customFlags?: CustomFlag[] 
  }

  interface CustomFlag {
    key: string
    active: boolean
  }
}

//Simple interface for healing items
declare namespace Item {
  interface Base {
    game: Phaser.Game
    id: number
    type: number
    name: string
    menuSprite: Phaser.Sprite
    targetType: number
    targetStat: string
    modifier: number
  }

  interface Constructor {
    id: number
    type: number
    name: string
    menuSpriteKey: string
    targetType: number
    targetStat: string
    modifier: number
  }
}

declare namespace Equipment {
  interface Base {
    game: Phaser.Game
    id: number
    type: number
    name: string
    stats: WeaponStats | ArmorStats
    sprite?: Phaser.Sprite
  }

  interface Constructor {
    id: number
    type: number
    name: string
    stats: WeaponStats | ArmorStats
    spriteKey: string
  }

  interface WeaponStats {
    ATTACK: number
    ACCURACY: number
  }

  interface ArmorStats {
    DEFENSE: number
    MAGIC_DEFENSE: number
    EVASION: number
    MAGIC_EVASION: number
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

  interface ItemMenuInfo {
    id: number
    name: Phaser.Text
    left: number
    leftText: Phaser.Text
    iconSprite: Phaser.Sprite
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

  interface ItemMenuSection {
    background: Phaser.Sprite
    itemsList: ItemMenuInfo[]
  }

  interface CharacterData {
    id: number
    name: string
    specialAttack: string
    items?: ItemData[]
    totalHealth?: number
    remainingHealth?: number
    cursorPosition?: MenuPoint
  }

  interface EnemyData {
    id: number
    name: string
    cursorPosition?: MenuPoint
  }

  interface ItemData {
    id: number
    name: string
    left: number
  }

  interface MenuData {
    characters: CharacterData[]
    enemies: EnemyData[]
  }
}
















