'use strict'

import Character from '../elements/character'
import Boss from '../elements/boss'
interface ISpecialAttack {
  key: string,
  animation?: Phaser.Animation
}
export default class Job {
  specialAttacks: ISpecialAttack[]

  constructor(game: Phaser.Game) {
    this.specialAttacks = []
    this.specialAttacks.push({
      key: 'jump'
    })
  }

  jumpAnimation(character: Character) {
    character.goToFront(this.makeJump)
  }

  makeJump(context: Phaser.Sprite) {
    const timer: Phaser.Timer = context.game.time.create(false)
    context.loadTexture(context.key, 'weak')    
    timer.loop(Phaser.Timer.QUARTER, () => {
      context.loadTexture(context.key, 'item')
      const tween = context.game.add.tween(context).to({y: context.y - 200, x: context.x -50}, 80, "Linear", true)      
      timer.stop()
    })
    timer.start()
  }

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

  reset(sprite: Phaser.Sprite, tween: Phaser.Tween, character: Character) {
    character.resetPosition()
  }


}