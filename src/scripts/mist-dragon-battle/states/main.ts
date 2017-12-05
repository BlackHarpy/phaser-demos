'use strict'

//TODO Refactor. Just make it work first! :)

import { COMMANDS } from './../constants';
import { CECIL, KAIN } from './../elements/character-constructor';
import { DARK_KNIGHT, DRAGOON } from './../elements/job-constructor';

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

export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Boss
  party: Character[]
  music: Phaser.Sound
  startedJump: Boolean
  batteMenu: BattleMenu
  lastOption: number

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
    this.startedJump = false
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
    this.batteMenu = new BattleMenu(this.game, menuData)
  }

  update(): void {
    this.game.input.onDown.addOnce(this.attack, this)
    const option: number = this.batteMenu.getOption()
    if (option !== this.lastOption) {
      this.makeCharacterAction(option, this.party[0])
      this.lastOption = option
    }
  }

  makeCharacterAction(command: number, character: Character): void {
    switch (command) {
      case COMMANDS.FIGHT.ID:
        character.attack()
        break
      case COMMANDS.SPECIAL_ATTACK.ID:
        character.specialAttack()
        break
      }
  }

  attack() {
    if (!this.startedJump) {
      this.party[0].specialAttack()      
      this.startedJump = true
    } else {
      this.party[0].finishJump(this.mistDragon)
      this.startedJump = false      
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

  // render(): void {
  // }

}