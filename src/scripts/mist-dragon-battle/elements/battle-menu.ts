'use strict'
import { MENU_HEIGHT, MENU_MARGIN, INITIAL_MENU_TEXT_POSITION_Y, COMMANDS, COMMANDS_POSITIONS } from './../constants';

interface ICharacterData {
  id: number,
  name: string,
  specialAttack: string,
  items?: string[]
  totalHealth?: number,
  remainingHealth?: number
}

interface IEnemyData {
  id: number,
  name: string
}

interface IMenuData {
  characters: ICharacterData[],
  enemies: IEnemyData[]
}

interface ICharacterMenuInfo {
  id: number,
  name: Phaser.Text,
  healthInfo: Phaser.Text
  initiativeBar?: Phaser.Sprite //no idea yet
}

interface IEnemyMenuInfo {
  id: number,
  name: Phaser.Text
}

interface ICommandsMenuInfo {
  id: number,
  name: Phaser.Text,
  position: string
}

interface ICharactersMenuSection {
  background: Phaser.Sprite,
  charactersList: ICharacterMenuInfo[]
}

interface IEnemiesMenuSection {
  background: Phaser.Sprite,
  enemiesList: IEnemyMenuInfo[]
}

interface ICommandsMenuSection {
  background: Phaser.Sprite,
  commandsList: ICommandsMenuInfo[]
}

interface MenuPoint {
  x: number,
  y: number
}

interface MenuSize {
  width: number,
  height: number
}

interface IBackgroundConfig {
  position: MenuPoint,
  anchor: MenuPoint,
  size: MenuSize
}

export default class BattleMenu {
  game: Phaser.Game
  enemySection: IEnemiesMenuSection
  menuData: IMenuData
  charactersSection: ICharactersMenuSection
  commandsSection: ICommandsMenuSection
  textStyle: Phaser.PhaserTextStyle

  constructor(game: Phaser.Game, menuData: IMenuData) {
    const textStyle: Phaser.PhaserTextStyle = {
      font: "22px Courier", fill: "#fff", strokeThickness: 4
    }
    this.textStyle = textStyle
    this.menuData = menuData
    this.game = game
    
    this.setEnemySection()
    this.setCharactersSection()
    this.openCommandsSection(1)
  }

  setCharactersSection(): void {
    const backgroundConfig = {
      anchor: {x: 1, y: 1},
      position: {x: this.game.world.width, y: this.game.world.height},
      size: {height: MENU_HEIGHT, width: 450}
    }

    this.charactersSection = {
      background: this.buildMenuBackground(backgroundConfig),
      charactersList: []
    }
    
    let y = INITIAL_MENU_TEXT_POSITION_Y    
    this.menuData.characters.forEach((value) => {
      const characterMenuInfo = this.buildCharacterMenuInfo(value)
      characterMenuInfo.name.position.set(340, y)
      characterMenuInfo.healthInfo.anchor.set(1, 0)
      characterMenuInfo.healthInfo.position.set(750, y)
      this.charactersSection.charactersList.push(characterMenuInfo)
      y += MENU_MARGIN      
    })
  }

  setEnemySection(): void {
    const backgroundConfig = {
      anchor: {x: 0, y: 1},
      position: {x: 0, y: this.game.world.height},
      size: {height: MENU_HEIGHT, width: 320}
    }

    this.enemySection = {
      background: this.buildMenuBackground(backgroundConfig),
      enemiesList: []
    }
    
    let y = INITIAL_MENU_TEXT_POSITION_Y
    this.menuData.enemies.forEach((value) => {
      const enemyMenuInfo = this.buildEnemyMenuInfo(value)
      enemyMenuInfo.name.position.set(20, y)
      this.enemySection.enemiesList.push(enemyMenuInfo)
      y += MENU_MARGIN
    })
  }

  buildMenuBackground(config: IBackgroundConfig): Phaser.Sprite {
    const background: Phaser.Sprite =  this.game.add.sprite(0, 0, 'rectangle')
    background.anchor.set(config.anchor.x, config.anchor.y)
    background.position.set(config.position.x, config.position.y)
    background.height = config.size.height
    background.width = config.size.width
    return background
  }

  openCommandsSection(characterID: number): void {
    const character = this.menuData.characters.find((value) => {
      return value.id === characterID
    })
    if (character) {
      const backgroundConfig = {
        anchor: {x: 0, y: 0},
        position: {x: 0, y: 0},
        size: {height: 100, width: 100}
      }
    }
  }

  buildCharacterMenuInfo(characterInfo: ICharacterData): ICharacterMenuInfo {
    const characterMenuInfo = {
      id: characterInfo.id,
      name: this.game.add.text(0, 0, characterInfo.name, this.textStyle),
      healthInfo: this.game.add.text(0, 0, `${characterInfo.remainingHealth} / ${characterInfo.totalHealth}`, this.textStyle)
    }
    return characterMenuInfo
  }

  buildEnemyMenuInfo(enemyInfo: IEnemyData): IEnemyMenuInfo {
    const enemyMenuInfo = {
      id: enemyInfo.id,
      name: this.game.add.text(0, 0, enemyInfo.name, this.textStyle)
    }
    return enemyMenuInfo
  }
}