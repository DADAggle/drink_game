import { GameState } from '../state/GameState';
import {
  actDrink,
  actHarass,
  actHarassSpam,
  actPhone,
  actPost,
  actPostSpam,
  actPretendNormal,
  onDialogAnswer,
} from '../state/Reducers';

export class ActionSystem {
  drink(state: GameState): string {
    const result = actDrink(state);
    return result.messages[0];
  }

  phone(state: GameState, volume: number): string {
    const result = actPhone(state, volume);
    return result.messages[0];
  }

  harass(state: GameState): string {
    const result = actHarass(state);
    return result.messages[0];
  }

  post(state: GameState): string {
    const result = actPost(state);
    return result.messages[0];
  }

  harassSpam(state: GameState, taps: number): string {
    const result = actHarassSpam(state, taps);
    return result.messages[0];
  }

  postSpam(state: GameState, taps: number): string {
    const result = actPostSpam(state, taps);
    return result.messages[0];
  }

  pretend(state: GameState): string {
    const result = actPretendNormal(state);
    if (!result) return '冷静中...';
    return result.messages[0];
  }

  dialogAnswer(state: GameState, isCorrect: boolean): string {
    const result = onDialogAnswer(state, isCorrect);
    return result.messages[0];
  }
}
