import { GAME_CONFIG } from '../state/Config';
import { GameState } from '../state/GameState';

export interface DialogQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface QteState {
  active: boolean;
  remaining: number;
  taps: number;
  need: number;
}

const DIALOGS: DialogQuestion[] = [
  { prompt: '朋友问: 最近怎么样?', options: ['挺稳的', '哈哈你是谁', '我要飞'], correctIndex: 0 },
  { prompt: '朋友问: 要不要喝慢点?', options: ['你说得对', '再来三杯', '手机借我'], correctIndex: 0 },
  { prompt: '朋友问: 明天上班吗?', options: ['要，得回家', '今天不睡了', '我会瞬移'], correctIndex: 0 },
];

export class NpcSystem {
  qte: QteState = { active: false, remaining: 0, taps: 0, need: 0 };

  update(state: GameState, dt: number): 'win' | 'lose' | null {
    if (!this.qte.active) {
      if (state.now >= state.qteNextAt) {
        this.qte.active = true;
        this.qte.remaining = GAME_CONFIG.qte.duration;
        this.qte.taps = 0;
        this.qte.need = GAME_CONFIG.qte.baseTap + Math.floor(state.stats.alc / 15);
        state.qteNextAt = state.now + GAME_CONFIG.qte.interval;
      }
      return null;
    }

    this.qte.remaining -= dt;
    if (this.qte.remaining > 0) {
      return null;
    }

    const win = this.qte.taps >= this.qte.need;
    this.qte.active = false;
    if (win) {
      state.counters.qteWin += 1;
      return 'win';
    }
    state.counters.qteLose += 1;
    return 'lose';
  }

  tapQte(): void {
    if (this.qte.active) {
      this.qte.taps += 1;
    }
  }

  randomDialog(): DialogQuestion {
    return DIALOGS[Math.floor(Math.random() * DIALOGS.length)];
  }

  garble(text: string, alc: number): string {
    const ratio = Math.max(0, (alc - 45) / 100);
    if (ratio <= 0) return text;
    return text
      .split('')
      .map((ch) => {
        if (ch === ' ' || ch === ':' || ch === '?') return ch;
        return Math.random() < ratio ? '#' : ch;
      })
      .join('');
  }
}
