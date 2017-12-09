'use strict'

import { COMMANDS } from './../constants';
import { CECIL, KAIN } from './../constructor-data/characters';
import { DARK_KNIGHT, DRAGOON } from './../constructor-data/jobs';

import State from '../../state'
import Character from '../elements/character'
import Enemy from '../elements/enemy'
import BattleMenu from '../elements/battle-menu'

const caveImage = require('assets/images/mist-dragon-battle/Cave.gif')
const battleMusic = require('assets/sound/mist-dragon-battle/bossfight.mp3')

const cecilAtlasImage = require('assets/images/mist-dragon-battle/cecil.png')
const cecilAtlasJSON = require('assets/images/mist-dragon-battle/cecil.json')
const kainAtlasImage = require('assets/images/mist-dragon-battle/kain.png')
const kainAtlasJSON = require('assets/images/mist-dragon-battle/kain.json')
const mistDragonAtlasImage = require('assets/images/mist-dragon-battle/mistDragon.png')
const mistDragonAtlasJSON = require('assets/images/mist-dragon-battle/mistDragon.json')
const rectangleImage = require('assets/images/mist-dragon-battle/rectangle.png')
const cursorImage = require('assets/images/mist-dragon-battle/HandCursor.gif')

const darknessImage = require('assets/images/mist-dragon-battle/XS1_01_Energy_Burst.png')
const slashImage = require('assets/images/mist-dragon-battle/XSlash1.png')
const jumpImage = require('assets/images/mist-dragon-battle/XCast.png')

//192 x 192

export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Enemy
  party: Character[]
  music: Phaser.Sound
  battleMenu: BattleMenu
  receivingCommand: number
  battleTimer: Phaser.Timer
  actionsQueue: CharacterAction.ActionData[]
  commandsQueue: number[]
  actionInProgress: Boolean
  testSprite: Phaser.Sprite

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('rectangle', rectangleImage)
    this.game.load.image('cursor', cursorImage)
    this.game.load.atlasJSONHash('mistDragon', mistDragonAtlasImage, mistDragonAtlasJSON)
    this.game.load.atlasJSONHash('cecil', cecilAtlasImage, cecilAtlasJSON)
    this.game.load.atlasJSONHash('kain', kainAtlasImage, kainAtlasJSON)
    this.game.load.spritesheet('dark', darknessImage, 192, 192, 35)
    this.game.load.spritesheet('slash', slashImage, 192, 192, 35)
    this.game.load.spritesheet('jump', jumpImage, 192, 192, 35)
    this.game.load.audio('bossBattleTheme', battleMusic)
  }

  create(): void {
    this.party = []
    this.music = this.game.add.sound('bossBattleTheme', 1)
    this.actionInProgress = false
    this.battleTimer = this.game.time.create(false)
    // this.music.play()
    this.caveBackground = this.game.add.sprite(0, 0, 'cave')
    this.caveBackground.scale.setTo(1.6)
    this.caveBackground.smoothed = false
    this.caveBackground.anchor.set(0.5, 0)
    this.caveBackground.x = this.game.world.centerX
    this.setMistDragon()
    this.setParty()
    this.actionsQueue = []
    this.commandsQueue = []
    this.receivingCommand = 0
    this.battleMenu = new BattleMenu(this.game, this.buildMenuData())
    this.setTimer()    
  }

  buildMenuData() {
    const characters = []
    this.party.forEach((character) => {
      characters.push({
        id: character.id,
        name: character.name,
        specialAttack: character.job.specialAttack.name,
        totalHealth: character.stats.HP,
        remainingHealth: character.stats.HP
      })
    })
    return {
      characters: characters,
      enemies: [{
        id: 1,
        name: 'Mist Dragon'
      }]
    }
  }

  setTimer() {
    this.battleTimer.loop(Phaser.Timer.HALF, () => {
      if (!this.actionInProgress && !this.battleMenu.isListeningInput()) {
        const nextReady: CharacterAction.ReadyCharacter[] = this.getReadyForAction()
        if (nextReady.length > 0) {
          const readyForActions: CharacterAction.ActionData[] = this.getAutomaticActions(nextReady)
          const readyForCommands: number[] = this.getReadyForCommands(nextReady)
          this.actionsQueue = this.actionsQueue.concat(readyForActions)
          this.commandsQueue = this.commandsQueue.concat(readyForCommands)
        }
      }
    })
    this.battleTimer.start()
  }

  update(): void {

    if (!this.battleMenu.isListeningInput()) {
      this.openCommandsForAvailableCharacter()
      this.doNextAction()         
    } else {
     this.processCharacterAction()
    }
  }

  processCharacterAction(): void {
    this.battleTimer.resume()
    const option: Promise<number> = this.getMenuOption()
    option.then(option => {
        const index = this.party.findIndex((value) => {
          return value.id === this.receivingCommand
        })
        this.addActionToQueue('CHARACTER', this.receivingCommand, 0, option)
        this.receivingCommand = 0      
        this.party[index].resetFocus()            
        this.party[index].prepareForAction()
    })
  }

  openCommandsForAvailableCharacter(): void {
    if (this.commandsQueue.length > 0) {
      const next: number = this.commandsQueue.shift()
      const character = this.getCharacter(next)
      if (character) {
        character.focus()          
      } 
      this.receivingCommand = next
      this.battleMenu.openCommandsSection(next)
      this.battleTimer.pause()
    }
  }

  async getMenuOption(): Promise<number> {
    return  await this.battleMenu.getOption()
  }

  getReadyForCommands(readyCharacters: CharacterAction.ReadyCharacter[]): number[] {
    return readyCharacters.map((character) => {
      if (Object.keys(character.automaticAction).length === 0) {
        return character.idReady
      }
    })
  }


  getAutomaticActions(readyCharacters: CharacterAction.ReadyCharacter[]): CharacterAction.ActionData[] {
    const readyWithAutomaticActions: CharacterAction.ReadyCharacter[] = readyCharacters.filter((character) => {
      return Object.keys(character.automaticAction).length > 0
    })

    return readyWithAutomaticActions.map((character) => {
      return character.automaticAction
    })
  }

  doNextAction() {
    if (this.actionsQueue.length) {
      const nextAction: CharacterAction.ActionData = this.actionsQueue.pop()
      if (nextAction.executor === 'CHARACTER') {
        this.battleTimer.pause()
        this.makeCharacterAction(nextAction.idAction, this.getCharacter(nextAction.idExec))
      }
    }
  }

  getCharacter(idCharacter) {
    return this.party.find((value) => {
      return value.id === idCharacter
    })
  }

  addActionToQueue(executor: any, idExec: number, idTarget: number, idAction: number) {
    const action: CharacterAction.ActionData = {
      executor: executor,
      idExec: idExec,
      idTarget: idTarget,
      idAction: idAction
    }
    this.actionsQueue.push(action)
    this.battleMenu.closeCommandsSection()
  }

  getReadyForAction(): CharacterAction.ReadyCharacter[] {
    let actions: CharacterAction.ReadyCharacter[] = []
    this.party.forEach((character) => {
      const returnAction: CharacterAction.ReadyCharacter = character.fillATB()
      if (returnAction.idReady !== 0) {
        actions.push(returnAction)
      }
    })
    return actions
  }

  async makeCharacterAction(command: number, character: Character): Promise<void> {
    this.actionInProgress = true    
    const finishedAction = await character.makeAction(command, this.mistDragon)
    if (finishedAction) {
      this.resumeTimer()
    }
  }

  setMistDragon(): void {
    this.mistDragon = new Enemy(this.game, 'mistDragon')
    this.mistDragon.setToBattle(this.caveBackground.centerY, this.caveBackground.centerX)
  }

  setParty(): void {
    this.party.push(new Character(this.game, KAIN, DRAGOON))
    this.party.push(new Character(this.game, CECIL, DARK_KNIGHT))

    this.party.forEach((value, index) => {
      value.setToBattle(this.caveBackground.height, this.party.length, index)
    })
  }

  resumeTimer() {
    this.battleTimer.resume()
    this.actionInProgress = false
  }

  render(): void {
    this.game.debug.text("Time passed: " + this.battleTimer.seconds.toFixed(0), 32, 400);
    this.game.debug.text("Cecil ATB: " + this.party[1].ATB, 32, 420);
    this.game.debug.text("Kain ATB: " + this.party[0].ATB, 32, 440);

    this.game.debug.text('Waiting Input: ' + this.battleMenu.isListeningInput(), 200, 420)
    this.game.debug.text('In command: ' + this.receivingCommand, 200, 440)
    
  }

}