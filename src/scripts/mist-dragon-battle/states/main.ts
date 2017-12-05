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

export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Boss
  party: Character[]
  music: Phaser.Sound
  battleMenu: BattleMenu
  lastOption: number
  battlePaused: Boolean
  ready: any
  battleTimer: Phaser.Timer
  actionsQueue: IAction[]

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
    this.battlePaused = false
    this.ready = {
      id: 0,
      type: 'NONE'
    }
    this.battleTimer = this.game.time.create(false)
    //this.music.play('', 0.3)
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
    this.battleMenu = new BattleMenu(this.game, menuData)
    this.setTimer()
  }

  setTimer() {
    this.battleTimer.loop(Phaser.Timer.QUARTER, () => {

      if (!this.battleMenu.commandSectionOpened) {
        this.fillCharactersATB()
        this.ready = this.getReadyForAction()
      }

    })
    this.battleTimer.start()    
  }

  update(): void {
    if (this.ready.id !== 0) {
      if (!this.battlePaused) {
        this.battleTimer.pause()
        this.battlePaused = true
        this.battleMenu.openCommandsSection(this.ready.id)
        this.battleMenu.commandSectionOpened = true
      }
    }

    if (this.battlePaused && this.battleMenu.commandSectionOpened) {
      //console.log(this.ready.id)
      const option: number = this.battleMenu.getOption()
      if ((option !== 0) && (option !== this.lastOption)) {
        const index = this.party.findIndex((value) => {
          return value.id === this.ready.id
        })
        this.addActionToQueue('CHARACTER', index, 0, option)
        this.party[index].prepareForAction()
        this.lastOption = option
        this.ready = {
          id: 0,
          type: 'NONE'
        }
      }
    } else {
      this.battleTimer.resume()  
      this.doNextAction()    
    }
  }

  doNextAction() {
    if (this.actionsQueue.length) {
      const nextAction: IAction = this.actionsQueue.shift()
      if (nextAction.executor === 'CHARACTER') {
        //this.battleTimer.pause()
        this.battlePaused = false
        this.makeCharacterAction(nextAction.idAction, this.party[nextAction.idExec])
      }
    }
    
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

  fillCharactersATB() {
    this.party.forEach((character) => {
      character.fillATB()
    })
  }

  getReadyForAction() {
    let ready = {
      id: 0,
      type: 'NONE'
    }
    const availableCharacters = this.party.filter((character) => {
      return character.ATB === 100
    })

    if (availableCharacters.length === 1) {
      ready = {
        id: availableCharacters[0].id,
        type: 'CHARACTER'
      }
    }

    if (availableCharacters.length > 1) {
      const maxSpeed = availableCharacters.reduce(function (prev, current) {
        return (prev.stats.SPEED > current.stats.SPEED) ? prev : current
      })
      ready = {
        id: maxSpeed.id,
        type: 'CHARACTER'
      }
    }
    return ready
  }

  makeCharacterAction(command: number, character: Character): void {
    character.ATB = 0
    character.makeAction(command, this.mistDragon)
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

  // render(): void {
  // }

}