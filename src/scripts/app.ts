/// <reference path="../../node_modules/phaser-ce/typescript/phaser.d.ts"/>
/// <reference path="../../node_modules/phaser-ce/typescript/pixi.d.ts"/>
'use strict'

import 'pixi'
import 'p2'
import 'phaser'

import IntroState from './states/intro'
import FinalFantasyState from './states/final-fantasy'

export default class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
      super(config)
      //this.state.add('intro', IntroState)      
      this.state.add('final-fantasy', FinalFantasyState)      
      this.state.start('final-fantasy')
    }
  }

window.onload = () => {
    const config: Phaser.IGameConfig = {
      width:           960, 
      height:          600,
      renderer:        Phaser.AUTO,       //Reseach further about Phaser.WEBGL_MULTI multi-texture rendering
      parent:          'content',
      resolution:      1,
      forceSetTimeOut: false
    }
    new App(config)
}