interface IPosition {
  x: number,
  y: number
}

declare namespace BattleMenu {
  interface Cursor {
    sprite: Phaser.Sprite,
    currentOption: number
  }

  interface MenuPoint {
    x: number,
    y: number
  }

  interface MenuSize {
    width: number,
    height: number
  }

  interface BackgroundConfig {
    position: MenuPoint,
    anchor: MenuPoint,
    size: MenuSize
  }

  interface CharacterMenuInfo {
    id: number,
    name: Phaser.Text,
    healthInfo: Phaser.Text
    initiativeBar?: Phaser.Sprite //no idea yet
  }

  interface EnemyMenuInfo {
    id: number,
    name: Phaser.Text
  }

  interface CommandsMenuInfo {
    id: number,
    name: Phaser.Text,
    position: string,
    cursorPosition?: MenuPoint
  }

  interface CharactersMenuSection {
    background: Phaser.Sprite,
    charactersList: CharacterMenuInfo[]
  }

  interface EnemiesMenuSection {
    background: Phaser.Sprite,
    enemiesList: EnemyMenuInfo[]
  }

  interface CommandsMenuSection {
    background: Phaser.Sprite,
    commandsList: CommandsMenuInfo[]
  }

  interface CharacterData {
    id: number,
    name: string,
    specialAttack: string,
    items?: string[]
    totalHealth?: number,
    remainingHealth?: number,
    cursorPosition?: MenuPoint
  }


  interface EnemyData {
    id: number,
    name: string,
    cursorPosition?: MenuPoint
  }

  interface MenuData {
    characters: CharacterData[],
    enemies: EnemyData[]
  }
}

declare namespace CharacterAction {
  interface ActionData {
    executor: string,
    idExec: number,
    idTarget: number,
    idAction: number
  }

  interface ReadyCharacter {
    idReady: number,
    automaticAction?: ActionData
  }
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
    animation?: Phaser.Animation,
    hitAnimation?: Phaser.Sprite
    play?(onEndCallback?: Function)
  }

  interface Animations {
    walk: AnimationData,
    attack?: AnimationData,
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
  }
}

declare namespace Job {
  interface Base {
    specialAttack: SpecialAttack
    fillATB: Function
    performSpecialAttack?: Function
  }

  interface SpecialAttack {
    key: string,
    name: string,
    chargeTime?: number,
    perform?: Function
  }
}










