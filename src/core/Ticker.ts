export class Ticker {
  private running = false;
  private last = 0;

  constructor(private readonly onTick: (dt: number) => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = Date.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
  }

  private loop(): void {
    if (!this.running) return;
    const now = Date.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.onTick(dt);
    requestAnimationFrame(() => this.loop());
  }
}
