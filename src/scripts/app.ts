/// <reference path="../../node_modules/phaser-ce/typescript/phaser.d.ts"/>
/// <reference path="../../node_modules/phaser-ce/typescript/pixi.d.ts"/>
/// <reference path="./types-definitions/phaser-demos.d.ts"/>

import 'pixi'
import 'p2'
import 'phaser'

import { IntroState } from './intro'
import { MainState as MistDragonBattleState } from './mist-dragon-battle/states/main'

export default class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
      super(config)
      //this.state.add('intro', IntroState)      
      this.state.add('mist-dragon-battle', MistDragonBattleState)      
      this.state.start('mist-dragon-battle')
    }
  }

window.onload = () => {
    const config: Phaser.IGameConfig = {
      width:           770, 
      height:          600,
      renderer:        Phaser.AUTO,       //Reseach further about Phaser.WEBGL_MULTI multi-texture rendering
      parent:          'content',
      resolution:      1,
      forceSetTimeOut: false
    }
    new App(config)
}