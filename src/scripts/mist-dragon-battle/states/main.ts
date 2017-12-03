'use strict'

//TODO Refactor. Just make it work first! :)

import State from '../../state'
import Character from '../elements/character'

const caveImage = require('assets/images/ffiv/Cave.gif')
const mistDragonImage = require('assets/images/ffiv/MistDragon1.gif')
const cecilImage = require('assets/images/ffiv/Cecil1.gif')
const kainImage = require('assets/images/ffiv/Kain.gif')
const cecilWalkSheet = require('assets/images/ffiv/Cecil1-Walk.png')
const kainlWalkSheet = require('assets/images/ffiv/Kain-Walk.png')
const battleMusic = require('assets/sound/ffiv/bossfight.mp3')

export default class MainState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Phaser.Sprite
  cecil: Phaser.Sprite
  kain: Phaser.Sprite
  party: Character[]
  animations: Phaser.Animation[]
  music: Phaser.Sound

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('mistDragon', mistDragonImage)
    this.game.load.image('cecil', cecilImage)
    this.game.load.image('kain', kainImage)
    this.game.load.spritesheet('cecilWalk', cecilWalkSheet, 32, 48, 2)
    this.game.load.spritesheet('kainWalk', kainlWalkSheet, 32, 48, 2)
    this.game.load.audio('bossBattleTheme', battleMusic)
  }
  
  create(): void {
    this.party = []
    this.animations = []
    this.music = this.game.add.sound('bossBattleTheme', 1)
    //this.music.play('', 0.3)
    this.caveBackground = this.game.add.sprite(0, 0, 'cave')     
    this.caveBackground.scale.setTo(1.6)
    this.caveBackground.smoothed = false
    this.caveBackground.anchor.set(0.5, 0)
    this.caveBackground.x = this.game.world.centerX
    console.log(this.caveBackground.height)
    console.log(this.caveBackground.width)
    this.setMistDragon()
    this.setParty(['kain', 'cecil'])
   
  }

  update(): void {
  }

  setMistDragon(): void {
    this.mistDragon = this.game.add.sprite(0, 0, 'mistDragon')
    this.mistDragon.scale.setTo(1.6)
    this.mistDragon.smoothed = false
    this.mistDragon.anchor.set(0.5, 0.5)
    this.mistDragon.y = this.caveBackground.centerY
    this.game.add.tween(this.mistDragon).to({x: this.game.world.centerX / 2},100, Phaser.Easing.Linear.None, true);
  }

  setParty(keys: string[]): void {
    keys.forEach((value) => {
      const i: number = this.party.length
      this.party.push(new Character(this.game, value))
      this.party[i].setToBattle(this.caveBackground.height, keys.length, i)
      //this.party[i].goToFront()
    })
  }

  // render(): void {
  // }

  animationStarted(sprite, animation): void {
    console.log('stuff', sprite, animation)
  }

  onUpdate(anim, frame) {
    console.log('frame', frame)
  }
}