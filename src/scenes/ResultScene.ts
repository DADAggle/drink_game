import { SharedContext } from '../core/Game';
import { Scene } from '../core/Scene';
import { Button } from '../ui/Button';
import { GAME_CONFIG } from '../state/Config';
import { endingText, titleByShame } from '../state/Reducers';

export class ResultScene implements Scene {
  private restartBtn!: Button;
  private ending = 'timeup';

  constructor(private readonly shared: SharedContext) {
    this.restartBtn = new Button(
      { x: this.shared.width / 2 - 80, y: this.shared.height - 120, w: 160, h: 52 },
      '你还想再喝吗'
    );
  }

  onEnter(payload?: unknown): void {
    const state = (payload as { state: any } | undefined)?.state ?? this.shared.getState();
    this.shared.setState(state);
    this.ending = state.ending ?? 'timeup';

    const title = titleByShame(state.stats.shame);
    const profile = this.shared.getProfile();
    if (state.stats.score > profile.bestScore) {
      this.shared.saveProfile({ bestScore: state.stats.score, bestTitle: title });
    }
  }

  onExit(): void {}

  update(_dt: number): void {}

  render(ctx: CanvasRenderingContext2D): void {
    const w = this.shared.width;
    const h = this.shared.height;
    const state = this.shared.getState();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1b1f2a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText(GAME_CONFIG.title, 20, 40);
    ctx.font = '20px sans-serif';
    ctx.fillText('本局总结海报', 20, 70);
    ctx.font = '16px sans-serif';
    ctx.fillText(endingText(this.ending as any), 20, 98);
    ctx.fillText(`积分: ${state.stats.score.toFixed(0)}`, 20, 124);
    ctx.fillText(`羞耻值: ${state.stats.shame.toFixed(0)}`, 20, 148);

    const title = titleByShame(state.stats.shame);
    ctx.fillText(`称号: ${title}`, 20, 174);
    if (state.stats.alc <= 20 && state.stats.shame <= 20) {
      ctx.fillStyle = '#8fe388';
      ctx.fillText('你没有逃避', 20, 198);
      ctx.fillStyle = '#ffffff';
    }

    ctx.fillText('行为统计', 20, 228);
    ctx.fillText(`喝酒: ${state.counters.drink}`, 20, 252);
    ctx.fillText(`外放视频: ${state.counters.phone}`, 20, 276);
    ctx.fillText(`骚扰电话: ${state.counters.harass}`, 20, 300);
    ctx.fillText(`发朋友圈: ${state.counters.post}`, 20, 324);
    ctx.fillText(`拒酒成功/失败: ${state.counters.qteWin}/${state.counters.qteLose}`, 20, 348);

    const profile = this.shared.getProfile();
    ctx.fillText(`历史最高分: ${profile.bestScore.toFixed(0)} (${profile.bestTitle})`, 20, 386);

    this.restartBtn.render(ctx);
  }

  onTap(x: number, y: number): void {
    if (this.restartBtn.contains(x, y)) {
      this.shared.restart();
    }
  }
}
