import { State } from '../../state'

const cursorMoveSFX = require('assets/sound/mist-dragon-battle/cursor-move.wav')
const cursorSelectSFX = require('assets/sound/mist-dragon-battle/cursor-select.wav')
const cursorImage = require('assets/images/mist-dragon-battle/HandCursor.gif')

export class MainState extends State {
  text: Phaser.Text
  cursor: Phaser.Sprite
  options: any[]
  buttonIsDown: boolean
  currentOption: number
  endState: boolean

  preload(): void {
    this.game.load.image('cursor', cursorImage)
    this.game.load.audio('cursorMoveSFX', cursorMoveSFX)
    this.game.load.audio('cursorSelectSFX', cursorSelectSFX)
  }
  create(): void {
    const textStyle: Phaser.PhaserTextStyle = {
      font: "22px Courier", fill: "#fff", strokeThickness: 4
    }
    this.options = [{
      position: {
        x: this.game.world.centerX,
        y: this.game.world.centerY + 40
      },
      text: new Phaser.Text(this.game, 0, 0, 'Yes', textStyle)
    }, {
      position: {
        x: this.game.world.centerX,
        y: this.game.world.centerY + 80
      },
      text: new Phaser.Text(this.game, 0, 0, 'No', textStyle)
    }]
    this.text = this.game.add.text(0, 0, 'Restart battle?', textStyle)
    this.text.anchor.set(0.5, 0.5)
    this.text.position.set(this.game.world.centerX, this.game.world.centerY)
    this.options.forEach(option => {
      this.game.add.existing(option.text)
      option.text.anchor.set(0.5, 0.5)
      option.text.position.set(option.position.x, option.position.y)
    })

    this.cursor = this.game.add.sprite(this.options[0].position.x - 70, this.options[0].position.y - 10, 'cursor')
    this.currentOption = 0
    this.endState = false
  }
  update(): void {
    if (!this.endState) {
      let option = this.currentOption
      const isDownDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)
      const isUpDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.UP)
      const isSpaceDown: boolean = this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
      if (!this.buttonIsDown && isDownDown && !isUpDown && !isSpaceDown) {
        option = option === this.options.length - 1 ? option = 0 : option += 1
        // this.sounds.cursorMove.play()
      } else if (!this.buttonIsDown && isUpDown && !isDownDown && !isSpaceDown) {
        option = option === 0 ? option = this.options.length - 1 : option -= 1
        // this.sounds.cursorMove.play()
      } else if (!this.buttonIsDown && !isUpDown && !isDownDown && isSpaceDown) {
        if (option === 0) {
          this.game.state.start('mist-dragon-battle')
        } else {
          this.text.text = 'Thanks for playing! Bye! :D'
          this.text.position.set(this.game.world.centerX, this.game.world.centerY)
          this.cursor.destroy()
          this.options.forEach(option => {
            option.text.destroy()
          })
          this.endState = true
        }
      }

      if (isUpDown || isDownDown) {
        this.currentOption = option
        const cursorPosition = {
          x: this.options[option].position.x - 70,
          y: this.options[option].position.y - 10
        }
        this.cursor.position.set(cursorPosition.x, cursorPosition.y)
        this.buttonIsDown = true
      }

      if (!isUpDown && !isDownDown && !isSpaceDown) {
        this.buttonIsDown = false
      }
    }
  }

}