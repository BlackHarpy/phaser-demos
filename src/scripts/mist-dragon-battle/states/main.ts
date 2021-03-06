import { Equipment } from './../elements/equipment';
import { ACTOR_TYPES, COMMANDS, CHARACTER_STATUS } from './../constants'
import { CECIL, KAIN, MIST_DRAGON } from './../constructor-data/characters'
import { RECOVERY_ITEMS } from './../constructor-data/items'
import { DARK_KNIGHT, DRAGOON } from './../constructor-data/jobs'

import { State } from '../../state'
import { Character } from '../elements/character'
import { Enemy } from '../elements/enemy'
import { Item } from '../elements/item'
import { BattleMenu } from '../elements/battle-menu'
import { BattleMechanics } from '../elements/battle-mechanics'
import {
  SPEAR, IRON_ARMOR, DARK_SWORD, DARK_ARMOR, BLACK_SHIELD,
  IRON_SHIELD, BLACK_HELM, IRON_HELM, BLACK_GAUNTLET, IRON_GAUNTLET
} from '../constructor-data/equipments';

const caveImage = require('assets/images/mist-dragon-battle/Cave.gif')
const battleMusic = require('assets/sound/mist-dragon-battle/bossfight.mp3')
const cursorMoveSFX = require('assets/sound/mist-dragon-battle/cursor-move.wav')
const cursorSelectSFX = require('assets/sound/mist-dragon-battle/cursor-select.wav')

const cecilAtlasImage = require('assets/images/mist-dragon-battle/cecil.png')
const cecilAtlasJSON = require('assets/images/mist-dragon-battle/cecil.json')
const kainAtlasImage = require('assets/images/mist-dragon-battle/kain.png')
const kainAtlasJSON = require('assets/images/mist-dragon-battle/kain.json')
const mistDragonAtlasImage = require('assets/images/mist-dragon-battle/mistDragon.png')
const mistDragonAtlasJSON = require('assets/images/mist-dragon-battle/mistDragon.json')
const rectangleImage = require('assets/images/mist-dragon-battle/rectangle.png')
const cursorImage = require('assets/images/mist-dragon-battle/HandCursor.gif')

const recoveryItemImage = require('assets/images/mist-dragon-battle/RecoveryItem.gif')
const darknessImage = require('assets/images/mist-dragon-battle/XS1_01_Energy_Burst.png')
const slashImage = require('assets/images/mist-dragon-battle/XSlash1.png')
const freezingMistImage = require('assets/images/mist-dragon-battle/XStarAura.png')

const bitmapFontImage = require('assets/fonts/damage-font.png')
const bitmapFontXML = require('assets/fonts/damage-font.xml')

export class MistDragonMainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Enemy
  party: Character[]
  enemies: Enemy[]
  music: Phaser.Sound
  battleMenu: BattleMenu
  receivingCommand: number
  battleTimer: Phaser.Timer
  actionsQueue: Battle.ActionData[]
  commandsQueue: number[]
  actionInProgress: boolean
  battleStarted: boolean
  musicCurrentSection: string
  commandInConstruction: Battle.ActionData
  waitingPromise: boolean

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('rectangle', rectangleImage)
    this.game.load.image('cursor', cursorImage)
    this.game.load.image('recoveryItem', recoveryItemImage)
    this.game.load.atlasJSONHash('mistDragon', mistDragonAtlasImage, mistDragonAtlasJSON)
    this.game.load.atlasJSONHash('cecil', cecilAtlasImage, cecilAtlasJSON)
    this.game.load.atlasJSONHash('kain', kainAtlasImage, kainAtlasJSON)
    this.game.load.spritesheet('dark', darknessImage, 192, 192, 35)
    this.game.load.spritesheet('slash', slashImage, 192, 192, 35)
    this.game.load.spritesheet('freezingMist', freezingMistImage, 192, 192, 35)
    this.game.load.audio('bossBattleTheme', battleMusic)
    this.game.load.audio('cursorMoveSFX', cursorMoveSFX)
    this.game.load.audio('cursorSelectSFX', cursorSelectSFX)
    this.game.load.bitmapFont('ffNumbers', bitmapFontImage, bitmapFontXML);
  }

  create(): void {
    this.battleStarted = false
    this.music = this.game.add.sound('bossBattleTheme', 1)
    this.enemies = []
    this.actionsQueue = []
    this.commandsQueue = []
    this.receivingCommand = 0
    this.actionInProgress = false
    this.initializeCommandInConstruction()
    this.game.sound.setDecodedCallback([this.music], this.setGameElements, this)
  }

  setGameElements() {
    this.caveBackground = this.setBattleBackground()
    this.enemies = this.setMistDragon()
    this.party = this.setParty()
    this.battleTimer = this.game.time.create(false)
    this.battleMenu = new BattleMenu(this.game, this.buildMenuData())
    this.startMusic()
    this.startBattle()
  }



  update(): void {
    if (this.battleStarted) {
      if (!this.battleMenu.isListeningInput()) {
        this.openCommandsForAvailableCharacter()
        this.doNextAction()
      } else {
        this.processCharacterAction()
      }
      this.checkBattleEnd()
    }
  }

  startMusic(): void {
    this.music.addMarker('start', 0, 3.3)
    this.music.addMarker('loop', 3.3, 61.4)
    this.musicCurrentSection = 'start'
    this.music.play(this.musicCurrentSection).onMarkerComplete.add(() => {
      this.musicCurrentSection = 'loop'
    }, this)
    this.music.onStop.add(() => {
      this.music.play(this.musicCurrentSection)
    })
  }

  startBattle(): void {
    this.battleStarted = true
    this.party = BattleMechanics.setInitialATB(this.party)
    this.startTimer()
  }

  initializeCommandInConstruction() {
    this.commandInConstruction = {
      executor: ACTOR_TYPES.CHARACTER,
      idExec: 0,
      idAction: 0,
      idTarget: 0,
      idItemUsed: 0
    }
  }

  getAvailableCharacters(): Character[] {
    return this.party.filter(character => {
      return character.status === CHARACTER_STATUS.NORMAL || character.status === CHARACTER_STATUS.DEFEND
    })
  }

  getCharacter(idCharacter: number) {
    return this.party.find((value) => {
      return value.id === idCharacter
    })
  }

  getEnemy(idEnemy: number) {
    return this.enemies.find((value) => {
      return value.id === idEnemy
    })
  }

  setBattleBackground(): Phaser.Sprite {
    const cave = new Phaser.Sprite(this.game, 0, 0, 'cave')
    cave.scale.setTo(1.6)
    cave.smoothed = false
    cave.anchor.set(0.5, 0)
    cave.x = this.game.world.centerX
    return this.game.add.existing(cave)
  }

  setMistDragon(): Enemy[] {
    const mistDragon = new Enemy(this.game, MIST_DRAGON)
    mistDragon.setToBattle(this.caveBackground.centerY, this.caveBackground.centerX)
    return [mistDragon]
  }

  setParty(): Character[] {
    const party: Character[] = []
    const kainInventory = this.constructInventory([{ id: 1, remaining: 1 }])
    const kainEquipment = this.constructEquipment([SPEAR, IRON_ARMOR, IRON_SHIELD, IRON_HELM, IRON_GAUNTLET])
    const cecilInventory = this.constructInventory([{ id: 1, remaining: 2 }, { id: 2, remaining: 1 }])
    const cecilEquipment = this.constructEquipment([DARK_SWORD, DARK_ARMOR, BLACK_SHIELD, BLACK_HELM, BLACK_GAUNTLET])
    party.push(new Character(this.game, KAIN, DRAGOON, kainInventory, kainEquipment))
    party.push(new Character(this.game, CECIL, DARK_KNIGHT, cecilInventory, cecilEquipment))

    party.forEach((value, index) => {
      value.setToBattle(this.caveBackground.height, party.length, index)
    })
    return party
  }

  //I dont really want to do an interface for this.
  constructInventory(itemsToAdd: any[]) {
    const inventory: Character.InventoryItem[] = []
    itemsToAdd.forEach(data => {
      const itemConstructor = RECOVERY_ITEMS.find(item => {
        return item.id === data.id
      })
      const item = new Item(this.game, itemConstructor)
      inventory.push({ item: item, remaining: data.remaining })
    })
    return inventory
  }

  //for this neither :(
  constructEquipment(equipmentToAdd: any[]) {
    const equipmentList: Equipment[] = []
    equipmentToAdd.forEach(constructor => {
      const equipment = new Equipment(this.game, constructor)
      equipmentList.push(equipment)
    })
    return equipmentList
  }

  buildMenuData(): any {
    const characters = []
    this.party.forEach((character) => {
      characters.push({
        id: character.id,
        name: character.name,
        specialAttack: character.job.specialAttack.name,
        totalHealth: character.stats.HP,
        remainingHealth: character.currentStats.HP,
        availableForTargeting: true,
        cursorPosition: {
          x: character.sprite.x - 220,
          y: character.sprite.centerY
        },
        items: this.buildItemMenuDataForCharacter(character)
      })
    })

    const enemies = []
    this.enemies.forEach((enemy) => {
      enemies.push({
        id: enemy,
        name: enemy.name,
        cursorPosition: {
          x: enemy.sprite.width + 90,
          y: enemy.sprite.centerY
        }
      })
    })
    return {
      characters: characters,
      enemies: enemies
    }
  }

  buildItemMenuDataForCharacter(character: Character) {
    const itemDataForMenu: BattleMenu.ItemData[] = []
    character.inventory.forEach(record => {
      const itemData = {
        id: record.item.id,
        name: record.item.name,
        left: record.remaining
      }
      itemDataForMenu.push(itemData)
    })
    return itemDataForMenu
  }


  getReadyForCommands(readyCharacters: Battle.ReadyCharacter[]): number[] {
    return readyCharacters.map((character) => {
      if (Object.keys(character.automaticAction).length === 0) {
        return character.idReady
      }
    })
  }

  getAutomaticActions(readyCharacters: Battle.ReadyCharacter[]): Battle.ActionData[] {
    const readyWithAutomaticActions: Battle.ReadyCharacter[] = readyCharacters.filter((character) => {
      return Object.keys(character.automaticAction).length > 0
    })

    return readyWithAutomaticActions.map((character) => {
      return character.automaticAction
    })
  }

  startTimer(): void {
    this.battleTimer.loop(Phaser.Timer.HALF, () => {
      if (!this.actionInProgress && !this.battleMenu.isListeningInput()) {
        const nextReady: Battle.ReadyCharacter[] = this.getReadyForAction()
        if (nextReady.length > 0) {
          const readyForActions: Battle.ActionData[] = this.getAutomaticActions(nextReady)
          const readyForCommands: number[] = this.getReadyForCommands(nextReady)
          this.actionsQueue = this.actionsQueue.concat(readyForActions)
          this.commandsQueue = this.commandsQueue.concat(readyForCommands)
        }
      }
    })
    this.battleTimer.start()
  }

  getMenuOption(): number {
    return this.battleMenu.getOption()
  }

  openCommandsForAvailableCharacter(): void {
    if (this.commandsQueue.length > 0) {
      const next: number = this.commandsQueue.shift()
      const character = this.getCharacter(next)
      if (character && character.status !== CHARACTER_STATUS.KO) {
        character.focus()
        this.receivingCommand = next ? next : 0
        this.battleMenu.openCommandsSection(next)
        this.battleTimer.pause()
      }

    }
  }

  characterHasItems(): boolean {
    const character = this.getCharacter(this.receivingCommand)
    return character ? character.inventory.length !== 0 : false
  }

  characterIsAvailable(): boolean {
    const character = this.getCharacter(this.receivingCommand)
    return character ? character.status !== CHARACTER_STATUS.KO : false
  }

  processCharacterAction(): void {
    this.battleTimer.resume()
    if (this.characterIsAvailable()) {
      if (this.commandInConstruction.idAction === 0) {
        const option: number = this.getMenuOption()
        this.commandInConstruction.idAction = option
        this.commandInConstruction.idExec = this.receivingCommand
      } else {
        let idAction = this.commandInConstruction.idAction
        if ((this.commandInConstruction.idAction === COMMANDS.ITEM.ID)) {
          if (this.characterHasItems()) {
            if (!this.battleMenu.isListeningItem()) {
              this.battleMenu.openItemSection(this.receivingCommand)
            } else {
              if (this.commandInConstruction.idItemUsed === 0) {
                const item: number = this.battleMenu.getItem()
                if (item !== 0) {
                  this.commandInConstruction.idItemUsed = item
                }
              }

            }
          } else {
            this.commandInConstruction.idAction = 0
            idAction = this.commandInConstruction.idAction
          }

        }
        const isAttacking = idAction === COMMANDS.FIGHT.ID || idAction === COMMANDS.SPECIAL_ATTACK.ID
        const isUsingItem = idAction === COMMANDS.ITEM.ID && this.commandInConstruction.idItemUsed !== 0
        if (isAttacking || isUsingItem) {
          const targetType = this.getCharacter(this.receivingCommand).getTargetType(this.commandInConstruction.idAction)
          const target = this.battleMenu.getTarget(targetType)
          this.commandInConstruction.idTarget = target
        }
        if (this.isCommandComplete()) {
          const index = this.party.findIndex((value) => {
            return value.id === this.receivingCommand
          })
          this.addActionToQueue(ACTOR_TYPES.CHARACTER, this.receivingCommand, this.commandInConstruction.idTarget, this.commandInConstruction.idAction, this.commandInConstruction.idItemUsed)
          this.receivingCommand = 0
          this.initializeCommandInConstruction()
          this.party[index].resetFocus()
          this.party[index].prepareForAction()
        }
      }
    } else {
      this.battleMenu.closeCommandsSection()
    }
  }

  isCommandComplete(): boolean {
    const command = this.commandInConstruction
    const completeValidators = {
      //attack
      [COMMANDS.FIGHT.ID]: command.idTarget !== 0,
      //item
      [COMMANDS.ITEM.ID]: command.idTarget !== 0 && command.idItemUsed !== 0,
      //special attack
      [COMMANDS.SPECIAL_ATTACK.ID]: command.idTarget !== 0,
      //defend
      [COMMANDS.DEFEND.ID]: true
    }
    return completeValidators[command.idAction]
  }

  addActionToQueue(executor: number, idExec: number, idTarget: number, idAction: number, idItem?: number) {
    const action: Battle.ActionData = {
      executor: executor,
      idExec: idExec,
      idTarget: idTarget,
      idAction: idAction,
      idItemUsed: idItem
    }
    this.actionsQueue.push(action)
    if (this.battleMenu.isListeningItem()) {
      this.battleMenu.closeItemsSection()
    }
    this.battleMenu.closeCommandsSection()
  }

  getReadyForAction(): Battle.ReadyCharacter[] {
    let actions: Battle.ReadyCharacter[] = []
    this.enemies.forEach(enemy => {
      const returnAction: Battle.ReadyCharacter = enemy.fillATB(BattleMechanics.getAvailableForTargeting(this.party))
      if (returnAction.hasOwnProperty('idReady') && returnAction.idReady !== 0) {
        actions.push(returnAction)
      }
    })
    this.party.forEach(character => {
      const returnAction: Battle.ReadyCharacter = character.fillATB()
      if (returnAction.hasOwnProperty('idReady') && returnAction.idReady !== 0) {
        actions.push(returnAction)
      }
    })
    return actions
  }

  doNextAction() {
    if (this.actionsQueue.length && !this.actionInProgress) {
      const nextAction: Battle.ActionData = this.actionsQueue.pop()
      if (nextAction.idAction !== 0) {
        const executor = nextAction.executor === ACTOR_TYPES.CHARACTER ? this.getCharacter(nextAction.idExec) : this.getEnemy(nextAction.idExec)
        if (executor.status !== CHARACTER_STATUS.KO) {
          this.battleTimer.pause()
          let target: Character | Enemy
          if (nextAction.idAction === COMMANDS.ITEM.ID) {
            //Friendly target
            target = this.party[nextAction.idTarget - 1]
          } else {
            target = nextAction.executor === ACTOR_TYPES.CHARACTER ? this.getEnemy(nextAction.idTarget) : this.getCharacter(nextAction.idTarget)
          }
          const groupTargets = nextAction.idTarget === 100 ? this.getAvailableCharacters() : []
          this.makeCharacterAction(nextAction.idAction, executor, target, groupTargets, nextAction.idItemUsed)
        }

      }
    }
  }

  async makeCharacterAction(command: number, actor: Character | Enemy, target: Character | Enemy, groupTargets?: any[], idItem?: number): Promise<void> {
    this.actionInProgress = true
    const finishedAction = await actor.makeAction(command, target, groupTargets, idItem)
    if (finishedAction.response = 'OK') {
      this.updateStatus(finishedAction)
    }
  }

  updateStatus(actionResult: Battle.ActionStatus) {
    const newStatus = actionResult.newStatus
    const statusPromises = []
    this.waitingPromise = true
    if (newStatus.hasOwnProperty('targets')) {
      newStatus.targets.forEach(target => {
        const actor: Character | Enemy = target.type === ACTOR_TYPES.CHARACTER ? this.getCharacter(target.id) : this.getEnemy(target.id)
        if (actor) {
          //change to set function
          if (target.hasOwnProperty('newHP')) {
            actor.currentStats.HP = target.newHP
          }
          if (target.hasOwnProperty('status')) {
            statusPromises.push(actor.setStatus(target.status))
          }
          if (target.hasOwnProperty('counterAttack') && target.counterAttack.idAction !== 0) {
            this.actionsQueue.unshift(target.counterAttack)
          }
        }
      })
    }
    if (newStatus.hasOwnProperty('character')) {
      const actor: Character = this.getCharacter(newStatus.character.id)
      if (actor) {
        if (newStatus.character.hasOwnProperty('newHP')) {
          actor.currentStats.HP = newStatus.character.newHP
        }
        if (newStatus.character.hasOwnProperty('status')) {
          statusPromises.push(actor.setStatus(newStatus.character.status))
        }
      }
    }
    Promise.all(statusPromises).then(result => {
      this.battleMenu.updateCharactersMenuInfo(this.party)
      this.waitingPromise = false
      this.resumeTimer()
    })

  }

  resumeTimer() {
    this.battleTimer.resume()
    this.actionInProgress = false
  }

  async endBattle(finalMessage: string) {
    this.waitingPromise = true
    this.battleStarted = false
    this.battleTimer.stop()
    this.battleMenu.closeCommandsSection()
    return await BattleMechanics.showMessage(this.game, finalMessage)
  }

  async checkBattleEnd() {
    if (!this.waitingPromise) {
      const partyHasFallen = this.party.every(character => {
        return character.status === CHARACTER_STATUS.KO
      })
      const enemiesHasFallen = this.enemies.every(enemy => {
        return enemy.status === CHARACTER_STATUS.KO
      })
      if (partyHasFallen) {
        this.endBattle('The party has fallen.')
        this.state.start('main')
      }
      if (enemiesHasFallen) {
        this.party.forEach(character => {
          if (character.status !== CHARACTER_STATUS.KO) {
            character.victory()
          }
        })
        await this.endBattle('The Mist Dragon has been defeated!')

        // this.state.start('main')        
      }
    }
  }

  //For debug purposes
  render(): void {
    // if (this.battleStarted) {
    //   this.game.debug.text("Seconds passed: " + this.battleTimer.seconds.toFixed(0), 32, 400);
    //   this.game.debug.text("Cecil ATB: " + this.party[1].ATB, 32, 420);
    //   this.game.debug.text("Kain ATB: " + this.party[0].ATB, 32, 440);

    //   this.game.debug.text('Mist Dragon HP: ' + this.enemies[0].currentStats.HP, 250, 400)
    //   this.game.debug.text('Waiting Input: ' + this.battleMenu.isListeningInput(), 250, 420)
    //   this.game.debug.text('In command: ' + this.receivingCommand, 250, 440)
    // }

  }

}