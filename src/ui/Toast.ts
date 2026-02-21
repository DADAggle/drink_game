interface ToastItem {
  text: string;
  ttl: number;
}

export class Toast {
  private items: ToastItem[] = [];

  push(text: string): void {
    this.items.push({ text, ttl: 2 });
    if (this.items.length > 4) {
      this.items.shift();
    }
  }

  update(dt: number): void {
    this.items.forEach((t) => {
      t.ttl -= dt;
    });
    this.items = this.items.filter((t) => t.ttl > 0);
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.font = '14px sans-serif';
    this.items.forEach((item, idx) => {
      ctx.globalAlpha = Math.max(0.2, item.ttl / 2);
      ctx.fillStyle = '#111111';
      ctx.fillRect(x, y + idx * 24, 240, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(item.text, x + 8, y + 15 + idx * 24);
    });
    ctx.restore();
  }
}
