'use strict'
import { MENU_HEIGHT, MENU_MARGIN, INITIAL_MENU_TEXT_POSITION_Y, COMMANDS, COMMANDS_POSITIONS } from './../constants';

export class BattleMenu {
  game: Phaser.Game
  enemySection: BattleMenu.EnemiesMenuSection
  menuData: BattleMenu.MenuData
  charactersSection: BattleMenu.CharactersMenuSection
  commandsSection: BattleMenu.CommandsMenuSection
  commandSectionOpened: Boolean
  cursor: BattleMenu.Cursor
  textStyle: Phaser.PhaserTextStyle
  activeList: any[]
  buttonIsDown: Boolean
  sounds: {
    cursorMove: {
      id: string,
      audio: Phaser.Sound,
      play?: Function
    },
    cursorSelect: {
      id: string,
      audio: Phaser.Sound,
      play?: Function
    },
  }

  constructor(game: Phaser.Game, menuData: BattleMenu.MenuData) {
    const textStyle: Phaser.PhaserTextStyle = {
      font: "22px Courier", fill: "#fff", strokeThickness: 4
    }
    this.textStyle = textStyle
    this.menuData = menuData
    this.game = game
    this.commandSectionOpened = false
    this.sounds = {
      cursorMove: {
        id: 'cursorMoveSFX',
        audio: this.game.add.sound('cursorMoveSFX'),
        play: () => {
          this.sounds.cursorMove.audio.play()
        }
      },
      cursorSelect: {
        id: 'cursorSelectSFX',
        audio: this.game.add.sound('cursorSelectSFX'),
        play: () => {
          this.sounds.cursorSelect.audio.play()
        }
      }
    }
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

  buildMenuBackground(config: BattleMenu.BackgroundConfig): Phaser.Sprite {
    const background: Phaser.Sprite = this.game.add.sprite(0, 0, 'rectangle')
    background.anchor.set(config.anchor.x, config.anchor.y)
    background.position.set(config.position.x, config.position.y)
    background.height = config.size.height
    background.width = config.size.width
    return background
  }

  
  buildCommandsList(character): BattleMenu.CommandsMenuInfo[] {
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

  buildCharacterMenuInfo(characterInfo: BattleMenu.CharacterData): BattleMenu.CharacterMenuInfo {
    const characterMenuInfo = {
      id: characterInfo.id,
      name: this.game.add.text(0, 0, characterInfo.name, this.textStyle),
      healthInfo: this.game.add.text(0, 0, `${characterInfo.remainingHealth} / ${characterInfo.totalHealth}`, this.textStyle)
    }
    return characterMenuInfo
  }

  buildEnemyMenuInfo(enemyInfo: BattleMenu.EnemyData): BattleMenu.EnemyMenuInfo {
    const enemyMenuInfo = {
      id: enemyInfo.id,
      name: this.game.add.text(0, 0, enemyInfo.name, this.textStyle)
    }
    return enemyMenuInfo
  }

  openCommandsSection(characterID: number): void {
    const character = this.menuData.characters.find((value) => {
      return value.id === characterID
    })
    if (character) {
      this.commandSectionOpened = true      
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

  closeCommandsSection() {
    this.commandSectionOpened = false    
    this.commandsSection.background.destroy()
    this.commandsSection.commandsList.forEach((command) => {
      command.name.destroy()
    })
    this.cursor.sprite.destroy()
  }

  setCursor(section: any): void {
    const initialX: number = section[0].cursorPosition.x
    const initialY: number = section[0].cursorPosition.y
    this.cursor = {
      sprite: this.game.add.sprite(initialX, initialY, 'cursor'),
      currentOption: 1
    }
  }

  isListeningInput(): Boolean {
    return this.commandSectionOpened
  }

  getOption(): Promise<number> {
    return new Promise(resolve => {
      let option = this.cursor.currentOption
      let selected = 0
      const isDownDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)
      const isUpDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.UP)
      const isSpaceDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)

      if (!this.buttonIsDown && isDownDown && !isUpDown && !isSpaceDown) {
        option = option === this.activeList.length ? option = 1 : option += 1
        this.sounds.cursorMove.play()        
      } else if (!this.buttonIsDown && isUpDown && !isDownDown && !isSpaceDown) {
        option = option === 1 ? option = this.activeList.length : option -= 1
        this.sounds.cursorMove.play()        
      } else if (!this.buttonIsDown && !isUpDown && !isDownDown && isSpaceDown) {
        selected = option
        this.sounds.cursorSelect.play()                
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
      } 

      if (!isUpDown && !isDownDown && !isSpaceDown) {
        this.buttonIsDown = false
      }

      if (selected !== 0) {
        resolve(selected)
      }
    })
  }

}