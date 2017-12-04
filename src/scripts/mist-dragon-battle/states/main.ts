'use strict'

//TODO Refactor. Just make it work first! :)

import State from '../../state'
import Character from '../elements/character'
import Boss from '../elements/boss'

const caveImage = require('assets/images/ffiv/Cave.gif')
const battleMusic = require('assets/sound/ffiv/bossfight.mp3')

const cecilAtlasImage = require('assets/images/ffiv/cecil.png')
const cecilAtlasJSON = require('assets/images/ffiv/cecil.json')
const kainAtlasImage = require('assets/images/ffiv/kain.png')
const kainAtlasJSON = require('assets/images/ffiv/kain.json')
const mistDragonAtlasImage = require('assets/images/ffiv/mistDragon.png')
const mistDragonAtlasJSON = require('assets/images/ffiv/mistDragon.json')


export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Boss
  cecil: Phaser.Sprite
  kain: Phaser.Sprite
  party: Character[]
  animations: Phaser.Animation[]
  music: Phaser.Sound
  front: Boolean

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.atlasJSONHash('mistDragon', mistDragonAtlasImage, mistDragonAtlasJSON)
    this.game.load.atlasJSONHash('cecil', cecilAtlasImage, cecilAtlasJSON)
    this.game.load.atlasJSONHash('kain', kainAtlasImage, kainAtlasJSON)
    this.game.load.audio('bossBattleTheme', battleMusic)
  }
  
  create(): void {
    this.party = []
    this.animations = []
    this.front = false
    this.music = this.game.add.sound('bossBattleTheme', 1)
    //this.music.play('', 0.3)
    this.caveBackground = this.game.add.sprite(0, 0, 'cave')     
    this.caveBackground.scale.setTo(1.6)
    this.caveBackground.smoothed = false
    this.caveBackground.anchor.set(0.5, 0)
    this.caveBackground.x = this.game.world.centerX
    this.setMistDragon()
    this.setParty(['kain', 'cecil'])
  }

  update(): void {
    this.game.input.onDown.addOnce(this.attack, this)
  }

  attack() {
    this.party[1].attack()
  }

  setMistDragon(): void {
    this.mistDragon = new Boss(this.game, 'mistDragon')
    this.mistDragon.setToBattle(this.caveBackground.centerY, this.caveBackground.centerX)
  }

  setParty(keys: string[]): void {
    keys.forEach((value) => {
      const i: number = this.party.length
      this.party.push(new Character(this.game, value))
      this.party[i].setToBattle(this.caveBackground.height, keys.length, i)
    })
  }

  // render(): void {
  // }

}