import { State } from './state'

const logoImage = require('assets/phaser.png')

export class IntroState extends State {

  helloWorld: Phaser.Sprite

  preload(): void {
    this.game.load.image('logo', logoImage)    
  } 
  
  create(): void {
    this.helloWorld = this.game.add.sprite(0, 0, 'logo')     
  }

  update(): void {
  }

}