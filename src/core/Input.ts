export interface TapEvent {
  x: number;
  y: number;
}

export class Input {
  private tapHandlers: Array<(e: TapEvent) => void> = [];
  private moveHandlers: Array<(e: TapEvent) => void> = [];
  private endHandlers: Array<(e: TapEvent) => void> = [];

  start(): void {
    wx.onTouchStart((e: any) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const event = { x: touch.clientX, y: touch.clientY };
      this.tapHandlers.forEach((h) => h(event));
    });
    wx.onTouchMove((e: any) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const event = { x: touch.clientX, y: touch.clientY };
      this.moveHandlers.forEach((h) => h(event));
    });
    wx.onTouchEnd((e: any) => {
      const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
      if (!touch) return;
      const event = { x: touch.clientX, y: touch.clientY };
      this.endHandlers.forEach((h) => h(event));
    });
  }

  onTap(handler: (e: TapEvent) => void): void {
    this.tapHandlers.push(handler);
  }

  onMove(handler: (e: TapEvent) => void): void {
    this.moveHandlers.push(handler);
  }

  onEnd(handler: (e: TapEvent) => void): void {
    this.endHandlers.push(handler);
  }
}
