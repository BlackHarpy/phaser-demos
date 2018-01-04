import { ACTOR_TYPES, ITEM_TYPES } from './../constants';

export const cure1 = {
  id: 1,
  type: ITEM_TYPES.HEALING,
  name: 'Cure1',
  targetType: ACTOR_TYPES.CHARACTER,
  targetStat: 'HP',
  modifier: 50
}

export const heal = {
  id: 2,
  type: ITEM_TYPES.HEALING,
  name: 'Heal',
  targetType: ACTOR_TYPES.CHARACTER,
  targetStat: 'HP',
  modifier: 100
}