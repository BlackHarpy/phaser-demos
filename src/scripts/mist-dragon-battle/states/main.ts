'use strict'

//TODO Refactor. Just make it work first! :)

import { COMMANDS } from './../constants';
import { CECIL, KAIN } from './../constructor-data/characters';
import { DARK_KNIGHT, DRAGOON } from './../constructor-data/jobs';

import State from '../../state'
import Character from '../elements/character'
import Boss from '../elements/boss'
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

interface IAction {
  executor: string,
  idExec: number,
  idTarget: number,
  idAction: number
}


interface IActionReady {
  idReady: number,
  automaticAction?: IAction
}

export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Boss
  party: Character[]
  music: Phaser.Sound
  battleMenu: BattleMenu
  lastOption: number
  battlePaused: Boolean
  receivingCommand: number
  battleTimer: Phaser.Timer
  actionsQueue: IAction[]
  commandsQueue: number[]
  actionInProgress: Boolean

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('rectangle', rectangleImage)
    this.game.load.image('cursor', cursorImage)
    this.game.load.atlasJSONHash('mistDragon', mistDragonAtlasImage, mistDragonAtlasJSON)
    this.game.load.atlasJSONHash('cecil', cecilAtlasImage, cecilAtlasJSON)
    this.game.load.atlasJSONHash('kain', kainAtlasImage, kainAtlasJSON)
    this.game.load.audio('bossBattleTheme', battleMusic)
  }

  create(): void {
    this.party = []
    this.lastOption = 0
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
    this.setParty(['kain', 'cecil'])
    const menuData = {
      characters: [{
        id: 1,
        name: 'Cecil',
        specialAttack: 'Darkness',
        totalHealth: 300,
        remainingHealth: 250
      }, {
        id: 2,
        name: 'Kain',
        specialAttack: 'Jump',
        totalHealth: 410,
        remainingHealth: 400
      }],
      enemies: [{
        id: 1,
        name: 'Mist Dragon'
      }]
    }
    this.actionsQueue = []
    this.commandsQueue = []
    this.receivingCommand = 0
    this.battleMenu = new BattleMenu(this.game, menuData)
    this.setTimer()
  }

  setTimer() {
    this.battleTimer.loop(Phaser.Timer.HALF, () => {
      if (!this.actionInProgress && !this.battleMenu.isListeningInput()) {
        const nextReady: IActionReady[] = this.getReadyForAction()
        if (nextReady.length > 0) {
          const readyForActions: IAction[] = this.getAutomaticActions(nextReady)
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
      if (this.commandsQueue.length > 0) {
        const next: number = this.commandsQueue.shift()
        this.receivingCommand = next
        this.battleMenu.openCommandsSection(next)
        this.battleTimer.pause()
      }
     this.doNextAction()         
    } else {
      this.battleTimer.resume()
      const option: Promise<number> = this.getMenuOption()
      option.then(option => {
          const index = this.party.findIndex((value) => {
            return value.id === this.receivingCommand
          })
          this.addActionToQueue('CHARACTER', this.receivingCommand, 0, option)
          this.receivingCommand = 0                  
          this.party[index].prepareForAction()
      })
    }
  }

  async getMenuOption(): Promise<number> {
    return  await this.battleMenu.getOption()
  }

  getReadyForCommands(readyCharacters: IActionReady[]): number[] {
    return readyCharacters.map((character) => {
      if (Object.keys(character.automaticAction).length === 0) {
        return character.idReady
      }
    })
  }


  getAutomaticActions(readyCharacters: IActionReady[]): IAction[] {
    const readyWithAutomaticActions: IActionReady[] = readyCharacters.filter((character) => {
      return Object.keys(character.automaticAction).length > 0
    })

    return readyWithAutomaticActions.map((character) => {
      return character.automaticAction
    })
  }

  doNextAction() {
    if (this.actionsQueue.length) {
      const nextAction: IAction = this.actionsQueue.pop()
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
    const action: IAction = {
      executor: executor,
      idExec: idExec,
      idTarget: idTarget,
      idAction: idAction
    }
    this.actionsQueue.push(action)
    this.battleMenu.closeCommandsSection()
  }

  getReadyForAction(): IActionReady[] {
    let actions: IActionReady[] = []
    this.party.forEach((character) => {
      const returnAction: IActionReady = character.fillATB()
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
    this.mistDragon = new Boss(this.game, 'mistDragon')
    this.mistDragon.setToBattle(this.caveBackground.centerY, this.caveBackground.centerX)
  }

  setParty(keys: string[]): void {
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