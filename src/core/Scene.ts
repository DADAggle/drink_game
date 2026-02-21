export type SceneName = 'party' | 'balance' | 'result';

export interface Scene {
  onEnter(payload?: unknown): void;
  onExit(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  onTap(x: number, y: number): void;
  onTouchMove?(x: number, y: number): void;
  onTouchEnd?(x: number, y: number): void;
}
