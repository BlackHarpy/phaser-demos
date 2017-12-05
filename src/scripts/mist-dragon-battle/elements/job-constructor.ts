'use strict'

import Character from './character'
import Boss from './boss'

export const DRAGOON = {
  name: 'Dragoon',
  specialAttack: {
    key: 'jump',
    name: 'Jump',
    chargeTime: 5,
    perform(chracter: Character, target: Boss): void {

    },
    jumpAnimation(character: Character) {
      character.goToFront(this.makeJump)
    },

    startJump(context: Phaser.Sprite) {
      const timer: Phaser.Timer = context.game.time.create(false)
      context.loadTexture(context.key, 'weak')    
      timer.loop(Phaser.Timer.QUARTER, () => {
        context.loadTexture(context.key, 'item')
        const tween = context.game.add.tween(context).to({y: context.y - 200, x: context.x -50}, 80, "Linear", true)      
        timer.stop()
      })
      timer.start()
    },

    finishJump(character: Character, target: Boss) {
      character.sprite.position.set(20, 50)
      character.sprite.loadTexture(character.sprite.key, 'jump')
      const hitTween = character.sprite.game.add.tween(character.sprite).to({y: target.sprite.centerY, x: target.sprite.centerX}, 200, "Linear")  
      const returnTween = character.sprite.game.add.tween(character.sprite).to({
        x: [400, character.initialPosition.x],
        y: [10, character.initialPosition.y]
      }, 300);
      returnTween.interpolation(function(v, k){
          return Phaser.Math.bezierInterpolation(v, k);
      });
      returnTween.onComplete.add(this.reset, this, 1, character)
      hitTween.chain(returnTween)
      hitTween.start()
    }
  }
}

export const DARK_KNIGHT = {
  name: 'Dark Knight',
  specialAttack: {
    key: 'darkness',
    name: 'Darkness',
    perform() {
      
    }
  }
}