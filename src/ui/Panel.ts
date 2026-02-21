export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Panel {
  static draw(ctx: CanvasRenderingContext2D, rect: Rect, color: string, alpha = 0.8): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }
}
