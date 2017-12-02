'use strict'

//TODO Refactor. Just make it work first! :)

import State from './state'

const caveImage = require('assets/images/ffiv/Cave.gif')
const mistDragonImage = require('assets/images/ffiv/MistDragon1.gif')
const cecilImage = require('assets/images/ffiv/Cecil1.gif')
const kainImage = require('assets/images/ffiv/Kain.gif')
const battleMusic = require('assets/sound/ffiv/bossfight.mp3')

export default class FinalFantasyState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Phaser.Sprite
  cecil: Phaser.Sprite
  kain: Phaser.Sprite
  party: Phaser.Sprite[]
  music: Phaser.Sound

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('mistDragon', mistDragonImage)
    this.game.load.image('cecil', cecilImage)
    this.game.load.image('kain', kainImage)
    this.game.load.audio('bossBattleTheme', battleMusic)
  }
  
  create(): void {
    this.party = []
    this.music = this.game.add.sound('bossBattleTheme', 1)
    this.music.play('', 0.3)
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
      this.party.push(this.game.add.sprite(this.world.width, 0, value))
      this.party[i].scale.setTo(1.6)
      this.party[i].smoothed = false
      this.party[i].anchor.set(0.5, 0.5)    
      this.game.add.tween(this.party[i]).to({x: this.game.world.centerX * 1.6}, 100, Phaser.Easing.Linear.None, true)
      this.party[i].y = this.caveBackground.height / (keys.length + 1) * (i + 1)
    })
  }

  // render(): void {
  // }

}