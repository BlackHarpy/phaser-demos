'use strict'

import { ACTOR_TYPES, COMMANDS, CHARACTER_STATUS } from './../constants';
import { CECIL, KAIN, MIST_DRAGON } from './../constructor-data/characters';
import { DARK_KNIGHT, DRAGOON } from './../constructor-data/jobs';

import { State } from '../../state'
import { Character } from '../elements/character'
import { Enemy } from '../elements/enemy'
import { BattleMenu } from '../elements/battle-menu'
import { BattleMechanics } from '../elements/battle-mechanics'
import { isUndefined } from 'util';

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

const bitmapFontImage = require('assets/fonts/number-font.png')
const bitmapFontXML = require('assets/fonts/number-font.xml')

export class MainState extends State {

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
    }

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
    party.push(new Character(this.game, KAIN, DRAGOON))
    party.push(new Character(this.game, CECIL, DARK_KNIGHT))

    party.forEach((value, index) => {
      value.setToBattle(this.caveBackground.height, party.length, index)
    })
    return party
  }

  buildMenuData(): any {
    const characters = []
    this.party.forEach((character) => {
      characters.push({
        id: character.id,
        name: character.name,
        specialAttack: character.job.specialAttack.name,
        totalHealth: character.stats.HP,
        remainingHealth: character.stats.HP,
        cursorPosition: {
          x: character.sprite.x - 220,
          y: character.sprite.centerY
        },
        items: character.items
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
      if (character) {
        character.focus()
      }
      this.receivingCommand = next ? next : 0
      this.battleMenu.openCommandsSection(next)
      this.battleTimer.pause()
    }
  }

  processCharacterAction(): void {
    this.battleTimer.resume()
    if (this.commandInConstruction.idAction === 0) {
      const option: number = this.getMenuOption()
      this.commandInConstruction.idAction = option
      this.commandInConstruction.idExec = this.receivingCommand
    } else {
      const idAction = this.commandInConstruction.idAction
      if (this.commandInConstruction.idAction === COMMANDS.ITEM.ID) {
        if (!this.battleMenu.isListeningItem()) {
          this.battleMenu.openItemSection(this.receivingCommand)
        } else {
          const item: number = this.battleMenu.getItem()
          this.commandInConstruction.idItemUsed = item
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
  }

  isCommandComplete(): boolean {
    const command = this.commandInConstruction
    const completeValidators = {
      //attack
      1: command.idTarget !== 0,
      //item
      2: command.idTarget !== 0 && command.idItemUsed !== 0,
      //special attack
      3: command.idTarget !== 0 
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
    this.battleMenu.closeItemsSection()
    this.battleMenu.closeCommandsSection()            
  }

  getReadyForAction(): Battle.ReadyCharacter[] {
    let actions: Battle.ReadyCharacter[] = []
    this.enemies.forEach(enemy => {
      const returnAction: Battle.ReadyCharacter = enemy.fillATB(BattleMechanics.getAvailableForTargeting(this.party))
      if (returnAction.idReady !== 0) {
        actions.push(returnAction)
      }
    })
    this.party.forEach(character => {
      const returnAction: Battle.ReadyCharacter = character.fillATB()
      if (returnAction.idReady !== 0) {
        actions.push(returnAction)
      }
    })
    return actions
  }

  doNextAction() {
    if (this.actionsQueue.length && !this.actionInProgress) {
      const nextAction: Battle.ActionData = this.actionsQueue.pop()
      this.battleTimer.pause()
      const executor = nextAction.executor === ACTOR_TYPES.CHARACTER ? this.getCharacter(nextAction.idExec) : this.getEnemy(nextAction.idExec)
      const target = nextAction.executor === ACTOR_TYPES.CHARACTER ? this.getEnemy(nextAction.idTarget) : this.getCharacter(nextAction.idTarget)
      this.makeCharacterAction(nextAction.idAction, executor, target)
    }
  }

  async makeCharacterAction(command: number, character: Character | Enemy, target: Character | Enemy): Promise<void> {
    this.actionInProgress = true
    const finishedAction = await character.makeAction(command, target)
    if (finishedAction) {
      this.resumeTimer()
    }
  }

  resumeTimer() {
    this.battleTimer.resume()
    this.actionInProgress = false
  }

  //For debug purposes
  render(): void {
    if (this.battleStarted) {
      this.game.debug.text("Seconds passed: " + this.battleTimer.seconds.toFixed(0), 32, 400);
      this.game.debug.text("Cecil ATB: " + this.party[1].ATB, 32, 420);
      this.game.debug.text("Kain ATB: " + this.party[0].ATB, 32, 440);

      this.game.debug.text('Mist Dragon ATB: ' + this.enemies[0].ATB, 250, 400)
      this.game.debug.text('Waiting Input: ' + this.battleMenu.isListeningInput(), 250, 420)
      this.game.debug.text('In command: ' + this.receivingCommand, 250, 440)
    }

  }

}