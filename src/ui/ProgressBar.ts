import { Rect } from './Panel';

export class ProgressBar {
  constructor(private readonly rect: Rect, private readonly color: string) {}

  render(ctx: CanvasRenderingContext2D, rate: number, label: string): void {
    const clamped = Math.max(0, Math.min(1, rate));
    ctx.save();
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.w * clamped, this.rect.h);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(label, this.rect.x + 6, this.rect.y + this.rect.h - 6);
    ctx.restore();
  }
}
