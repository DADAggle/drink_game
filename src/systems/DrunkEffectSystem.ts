import { GAME_CONFIG } from '../state/Config';
import { GameState } from '../state/GameState';

export class DrunkEffectSystem {
  private shakeTimer = 0;
  private invertWindow = 0;
  private invertCooldown = 0;

  update(state: GameState, dt: number): void {
    if (state.drunkFlags.shake) {
      this.shakeTimer += dt;
    } else {
      this.shakeTimer = 0;
    }

    if (!state.drunkFlags.invertControl) {
      this.invertWindow = 0;
      this.invertCooldown = 0;
      return;
    }

    this.invertCooldown += dt;
    if (this.invertWindow > 0) {
      this.invertWindow = Math.max(0, this.invertWindow - dt);
    } else if (this.invertCooldown >= 5) {
      this.invertCooldown = 0;
      this.invertWindow = 2;
    }
  }

  getShakeOffset(): { x: number; y: number } {
    if (this.shakeTimer <= 0) return { x: 0, y: 0 };
    return {
      x: Math.sin(this.shakeTimer * 18) * 4,
      y: Math.cos(this.shakeTimer * 16) * 3,
    };
  }

  isInverted(): boolean {
    return this.invertWindow > 0;
  }

  buttonDrift(seed: number, alc: number): { dx: number; dy: number } {
    if (this.invertWindow <= 0) return { dx: 0, dy: 0 };
    const over = Math.max(0, alc - GAME_CONFIG.drunkChaos.flyThreshold);
    const ampX = GAME_CONFIG.drunkChaos.flyAmpBaseX + over * GAME_CONFIG.drunkChaos.flyAmpScaleX;
    const ampY = GAME_CONFIG.drunkChaos.flyAmpBaseY + over * GAME_CONFIG.drunkChaos.flyAmpScaleY;
    return {
      dx: Math.sin(seed + this.shakeTimer * 8) * ampX,
      dy: Math.cos(seed + this.shakeTimer * 6) * ampY,
    };
  }
}
