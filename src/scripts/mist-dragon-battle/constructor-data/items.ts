import { ACTOR_TYPES, ITEM_TYPES } from './../constants';

export const RECOVERY_ITEMS = [{
  id: 1,
  type: ITEM_TYPES.HEALING,
  name: 'Cure1',
  targetType: ACTOR_TYPES.CHARACTER,
  targetStat: 'HP',
  modifier: 50,
  menuSpriteKey: 'recoveryItem'
}, {
  id: 2,
  type: ITEM_TYPES.HEALING,
  name: 'Heal',
  targetType: ACTOR_TYPES.CHARACTER,
  targetStat: 'HP',
  modifier: 100,
  menuSpriteKey: 'recoveryItem'  
}]
