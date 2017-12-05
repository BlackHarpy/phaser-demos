'use strict'
import { MENU_HEIGHT, MENU_MARGIN, INITIAL_MENU_TEXT_POSITION_Y, COMMANDS, COMMANDS_POSITIONS } from './../constants';

interface ICharacterData {
  id: number,
  name: string,
  specialAttack: string,
  items?: string[]
  totalHealth?: number,
  remainingHealth?: number,
  cursorPosition?: MenuPoint
}

interface IEnemyData {
  id: number,
  name: string,
  cursorPosition?: MenuPoint  
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
  position: string,
  cursorPosition?: MenuPoint
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

interface ICursor {
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
  commandSectionOpened: Boolean
  cursor: ICursor
  textStyle: Phaser.PhaserTextStyle
  activeList: any[]
  buttonIsDown: Boolean  

  constructor(game: Phaser.Game, menuData: IMenuData) {
    const textStyle: Phaser.PhaserTextStyle = {
      font: "22px Courier", fill: "#fff", strokeThickness: 4
    }
    this.textStyle = textStyle
    this.menuData = menuData
    this.game = game
    this.commandSectionOpened = false

    this.setEnemySection()
    this.setCharactersSection()
  }

  setCharactersSection(): void {
    const backgroundConfig = {
      anchor: { x: 1, y: 1 },
      position: { x: this.game.world.width, y: this.game.world.height },
      size: { height: MENU_HEIGHT, width: 450 }
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
      anchor: { x: 0, y: 1 },
      position: { x: 0, y: this.game.world.height },
      size: { height: MENU_HEIGHT, width: 320 }
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
    const background: Phaser.Sprite = this.game.add.sprite(0, 0, 'rectangle')
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
        anchor: { x: 1, y: 1 },
        position: { x: 320, y: this.game.world.height},
        size: { height: MENU_HEIGHT, width: 200 }
      }
      this.commandsSection = {
        background: this.buildMenuBackground(backgroundConfig),
        commandsList: this.buildCommandsList(character)
      }
      let y = INITIAL_MENU_TEXT_POSITION_Y      
      this.commandsSection.commandsList.forEach((value) => {
        value.name.position.set(140, y)
        value.cursorPosition = {
          x: 105,
          y:  value.name.centerY - 12
        }
        y += MENU_MARGIN        
      })
      this.setCursor(this.commandsSection.commandsList)
      this.activeList = this.commandsSection.commandsList
    }
  }

  setCursor(section: any): void {
    const initialX: number = section[0].cursorPosition.x
    const initialY: number = section[0].cursorPosition.y
    this.cursor = {
      sprite: this.game.add.sprite(initialX, initialY, 'cursor'),
      currentOption: 1
    }
  }

  getOption(): number {
    let option = this.cursor.currentOption
    let selected = 0
    const isDownDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)
    const isUpDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.UP)
    const isSpaceDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)

    if (!this.buttonIsDown && isDownDown && !isUpDown && !isSpaceDown) {
      option = option === this.activeList.length ? option = 1 : option += 1
      
    } else if (!this.buttonIsDown && isUpDown && !isDownDown && !isSpaceDown) {
      option = option === 1 ? option = this.activeList.length : option -= 1
    } else if (!this.buttonIsDown && !isUpDown && !isDownDown && isSpaceDown) {
      selected = option
      this.buttonIsDown = true            
    }
    if (isUpDown || isDownDown) {
      this.cursor.currentOption = option
      const cursorPosition = {
        x: this.activeList[option - 1].cursorPosition.x,
        y: this.activeList[option - 1].cursorPosition.y
      }
      this.cursor.sprite.position.set(cursorPosition.x, cursorPosition.y)
      this.buttonIsDown = true      
    } else {
      this.buttonIsDown = false
    }
    return selected
  }

  buildCommandsList(character): ICommandsMenuInfo[] {
    const commandsList = []
    for (let key in COMMANDS) {
      if (COMMANDS[key].POSITION === COMMANDS_POSITIONS.MAIN) {
        const commandLabel = COMMANDS[key].ID === COMMANDS.SPECIAL_ATTACK.ID ? character.specialAttack : COMMANDS[key].LABEL
        const command = {
          id: COMMANDS[key].ID,
          name: this.game.add.text(0, 0, commandLabel, this.textStyle),
          position: COMMANDS[key].POSITION
        }
        commandsList.push(command)
      }
    }
    return commandsList
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