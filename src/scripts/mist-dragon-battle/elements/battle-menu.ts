import { MENU_HEIGHT, MENU_MARGIN, INITIAL_MENU_TEXT_POSITION_Y, COMMANDS, COMMANDS_POSITIONS, ACTOR_TYPES, SCALE, CHARACTER_STATUS } from './../constants';
import { Character } from './character';

export class BattleMenu {
  game: Phaser.Game
  enemySection: BattleMenu.EnemiesMenuSection
  menuData: BattleMenu.MenuData
  charactersSection: BattleMenu.CharactersMenuSection
  commandsSection: BattleMenu.CommandsMenuSection
  itemSection: BattleMenu.ItemMenuSection
  commandSectionOpened: boolean
  itemMenuOpened: boolean
  targetSelectionActive: boolean
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
    this.itemMenuOpened = false
    this.targetSelectionActive = false
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

  getMenuCharacterIndex(id: number): number {
    return this.menuData.characters.findIndex(character => {
      return character.id === id
    })
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

  openItemSection(id: number): void {
    this.cursor.sprite.destroy()
    const backgroundConfig = {
      anchor: { x: 0, y: 1 },
      position: { x: 0, y: this.game.world.height },
      size: { height: MENU_HEIGHT, width: this.game.world.width }
    }

    this.itemSection = {
      background: this.buildMenuBackground(backgroundConfig),
      itemsList: []
    }

    let y = INITIAL_MENU_TEXT_POSITION_Y
    this.menuData.characters[this.getMenuCharacterIndex(id)].items.forEach((item) => {
      const itemMenuInfo = this.buildItemMenuInfo(item)
      itemMenuInfo.iconSprite.position.set(20, y + 2)
      itemMenuInfo.name.position.set(40, y)
      itemMenuInfo.leftText.position.set(250, y)
      itemMenuInfo.cursorPosition = {
        x: 7,
        y: y
      }
      this.itemSection.itemsList.push(itemMenuInfo)
      y += MENU_MARGIN
    })
    this.itemMenuOpened = true
    this.setCursor(this.itemSection.itemsList)
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

  updateHealthInfo(characterInfo: BattleMenu.CharacterData) {
    const characterMenuInfo = this.charactersSection.charactersList.find(characterMenuInfo => {
      return characterMenuInfo.id === characterInfo.id
    })
    if (characterMenuInfo) {
      characterMenuInfo.healthInfo.text = `${characterInfo.remainingHealth} / ${characterInfo.totalHealth}`
      characterMenuInfo.availableForTargeting = characterInfo.availableForTargeting
    }
  }

  buildCharacterMenuInfo(characterInfo: BattleMenu.CharacterData): BattleMenu.CharacterMenuInfo {
    const characterMenuInfo = {
      id: characterInfo.id,
      name: this.game.add.text(0, 0, characterInfo.name, this.textStyle),
      healthInfo: this.game.add.text(0, 0, `${characterInfo.remainingHealth} / ${characterInfo.totalHealth}`, this.textStyle),
      availableForTargeting: characterInfo.availableForTargeting
    }
    return characterMenuInfo
  }

  buildEnemyMenuInfo(enemyInfo: BattleMenu.EnemyData): BattleMenu.EnemyMenuInfo {
    const enemyMenuInfo = {
      id: enemyInfo.id,
      name: this.game.add.text(0, 0, enemyInfo.name, this.textStyle),
      cursorPosition: enemyInfo.cursorPosition
    }
    return enemyMenuInfo
  }

  buildItemMenuInfo(itemInfo: BattleMenu.ItemData): BattleMenu.ItemMenuInfo {
    const itemMenuInfo = {
      id: itemInfo.id,
      name: this.game.add.text(0, 0, itemInfo.name, this.textStyle),
      left: itemInfo.left,
      leftText: this.game.add.text(0, 0, `:  ${itemInfo.left.toString()}`, this.textStyle),
      iconSprite: this.game.add.sprite(0, 0, 'recoveryItem'),
    }
    return itemMenuInfo
  }

  openCommandsSection(characterID: number): void {
    const character = this.menuData.characters.find((value) => {
      return value.id === characterID
    })
    if (character) {
      this.commandSectionOpened = true
      const backgroundConfig = {
        anchor: { x: 1, y: 1 },
        position: { x: 320, y: this.game.world.height },
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
          y: value.name.centerY - 12
        }
        y += MENU_MARGIN
      })
      this.setCursor(this.commandsSection.commandsList)
      this.activeList = this.commandsSection.commandsList
    }
  }

  closeCommandsSection() {
    this.commandsSection.background.destroy()
    this.commandsSection.commandsList.forEach((command) => {
      command.name.destroy()
    })
    this.cursor.sprite.destroy()
    this.commandSectionOpened = false
  }

  closeItemsSection() {
    this.itemSection.background.destroy()
    this.itemSection.itemsList.forEach((item) => {
      item.name.destroy()
      item.iconSprite.destroy()
      item.leftText.destroy()
    })
    this.cursor.sprite.destroy()
    this.itemMenuOpened = false
  }

  setCursor(section: any): void {
    const initialX: number = section[0].cursorPosition.x
    const initialY: number = section[0].cursorPosition.y
    this.cursor = {
      sprite: this.game.add.sprite(initialX, initialY, 'cursor'),
      currentOption: 1
    }
  }

  isListeningInput(): boolean {
    return this.commandSectionOpened
  }

  isListeningItem(): boolean {
    return this.itemMenuOpened
  }

  getAvailableFirstOption() {
    const index = this.activeList.findIndex(element => {
      return element.availableForTargeting
    })

    return index !== -1 ? index + 1 : 1
  }

  getOption(): number {
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
      this.cursor.currentOption = this.getAvailableFirstOption()
      this.sounds.cursorSelect.play()
      this.buttonIsDown = true
    }

    if (isUpDown || isDownDown) {

      if (this.activeList[option - 1].hasOwnProperty('availableForTargeting')) {
        if (this.activeList[option - 1].availableForTargeting) {
          this.cursor.currentOption = option
          const cursorPosition = {
            x: this.activeList[option - 1].cursorPosition.x,
            y: this.activeList[option - 1].cursorPosition.y
          }
          this.cursor.sprite.position.set(cursorPosition.x, cursorPosition.y)
          this.buttonIsDown = true
        } 
      } else {
        this.cursor.currentOption = option
        const cursorPosition = {
          x: this.activeList[option - 1].cursorPosition.x,
          y: this.activeList[option - 1].cursorPosition.y
        }
        this.cursor.sprite.position.set(cursorPosition.x, cursorPosition.y)
        this.buttonIsDown = true

      }
    }

    if (!isUpDown && !isDownDown && !isSpaceDown) {
      this.buttonIsDown = false
    }
    return selected
  }

  getTarget(targetType: number): number {

    if (targetType === ACTOR_TYPES.ENEMY) {
      this.activeList = this.menuData.enemies
      this.cursor.sprite.scale.x = -1

    } else {
      this.activeList = this.menuData.characters
    }
    const cursorPosition = {
      x: this.activeList[this.cursor.currentOption - 1].cursorPosition.x,
      y: this.activeList[this.cursor.currentOption - 1].cursorPosition.y
    }
    this.cursor.sprite.position.set(cursorPosition.x, cursorPosition.y)
    return this.getOption()

  }

  getItem(): number {
    this.activeList = this.itemSection.itemsList
    const cursorPosition = {
      x: this.activeList[this.cursor.currentOption - 1].cursorPosition.x,
      y: this.activeList[this.cursor.currentOption - 1].cursorPosition.y
    }
    this.cursor.sprite.position.set(cursorPosition.x, cursorPosition.y)
    const option = this.getOption()
    let idSelected = 0
    if (option !== 0) {
      idSelected = this.activeList[option - 1].id
    }
    return idSelected
  }

  updateItemInfo(character: Character): BattleMenu.ItemData[] {
    return character.inventory.map(record => {
      return {
        id: record.item.id,
        name: record.item.name,
        left: record.remaining
      }
    })
  }
  updateCharactersMenuInfo(characters: Character[]) {
    characters.forEach(character => {
      const characterMenuData: BattleMenu.CharacterData = this.menuData.characters.find(characterMenuData => {
        return characterMenuData.id === character.id
      })
      characterMenuData.remainingHealth = character.currentStats.HP
      characterMenuData.items = this.updateItemInfo(character)
      characterMenuData.availableForTargeting = (character.status === CHARACTER_STATUS.NORMAL || character.status === CHARACTER_STATUS.DEFEND)
      this.updateHealthInfo(characterMenuData)
    })
  }

}