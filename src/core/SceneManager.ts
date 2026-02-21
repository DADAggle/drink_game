import { Scene, SceneName } from './Scene';

export class SceneManager {
  private currentScene: Scene;

  constructor(
    private readonly factory: (name: SceneName) => Scene,
    initial: SceneName
  ) {
    this.currentScene = this.factory(initial);
    this.currentScene.onEnter();
  }

  switch(name: SceneName, payload?: unknown): void {
    this.currentScene.onExit();
    this.currentScene = this.factory(name);
    this.currentScene.onEnter(payload);
  }

  update(dt: number): void {
    this.currentScene.update(dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.currentScene.render(ctx);
  }

  onTap(x: number, y: number): void {
    this.currentScene.onTap(x, y);
  }

  onTouchMove(x: number, y: number): void {
    this.currentScene.onTouchMove?.(x, y);
  }

  onTouchEnd(x: number, y: number): void {
    this.currentScene.onTouchEnd?.(x, y);
  }
}
