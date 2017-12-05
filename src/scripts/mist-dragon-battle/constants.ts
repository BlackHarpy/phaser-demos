export const SCALE: number = 1.6
export const MENU_HEIGHT: number = 150
export const MENU_MARGIN: number = 30
export const INITIAL_MENU_TEXT_POSITION_Y = 460
export const COMMANDS = {
  FIGHT: {
    ID: 1,
    LABEL: 'Fight',
    POSITION: 'MAIN'
  }, 
  ITEM: {
    ID: 2,
    LABEL: 'Item',    
    POSITION: 'MAIN'
  },
  SPECIAL_ATTACK: {
    ID: 3,
    LABEL: '-',    
    POSITION: 'MAIN'
  },
  DEFEND: {
    ID: 4,
    LABEL: 'Defend',    
    POSITION: 'RIGHT'
  },
  SKIP_TURN: {
    ID: 5,
    LABEL: '-',    
    POSITION: 'SKIP'
  },
  RUN: {
    ID: 6,
    LABEL: '-',    
    POSITION: 'SPECIAL'
  }
}
export const COMMANDS_POSITIONS = {
  MAIN: 'MAIN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  SKIP: 'SKIP',
  RUN: 'SPECIAL'
}

export const CHARACTER_STATUS = {
  NORMAL: 1,
  KO: 2,
  JUMP: 3
}