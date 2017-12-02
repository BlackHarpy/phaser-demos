'use strict'

//TODO Refactor. Just make it work first! :)

import State from './state'

const caveImage = require('assets/images/ffiv/Cave.gif')
const mistDragonImage = require('assets/images/ffiv/MistDragon1.gif')
const cecilImage = require('assets/images/ffiv/Cecil1.gif')
const kainImage = require('assets/images/ffiv/Kain.gif')

export default class FinalFantasyState extends State {

  caveBackground: Phaser.Sprite
  mistDragon: Phaser.Sprite
  cecil: Phaser.Sprite
  kain: Phaser.Sprite
  party: Phaser.Sprite[]

  preload(): void {
    this.game.load.image('cave', caveImage)
    this.game.load.image('mistDragon', mistDragonImage)
    this.game.load.image('cecil', cecilImage)
    this.game.load.image('kain', kainImage)
  }
  
  create(): void {
    this.party = []
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
    this.mistDragon.x = this.game.world.centerX / 2
  }

  setParty(keys: string[]): void {
    keys.forEach((value) => {
      const i: number = this.party.length
      this.party.push(this.game.add.sprite(0, 0, value))
      this.party[i].scale.setTo(1.6)
      this.party[i].smoothed = false
      this.party[i].anchor.set(0.5, 0.5)    
      this.party[i].x = this.game.world.centerX * 1.6
      this.party[i].y = this.caveBackground.height / (keys.length + 1) * (i + 1)
    })
  }

  // render(): void {
  // }

}