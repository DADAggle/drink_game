"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrunkEffectSystem = void 0;
const Config_1 = require("../state/Config");
class DrunkEffectSystem {
    constructor() {
        this.shakeTimer = 0;
        this.invertWindow = 0;
        this.invertCooldown = 0;
    }
    update(state, dt) {
        if (state.drunkFlags.shake) {
            this.shakeTimer += dt;
        }
        else {
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
        }
        else if (this.invertCooldown >= 5) {
            this.invertCooldown = 0;
            this.invertWindow = 2;
        }
    }
    getShakeOffset() {
        if (this.shakeTimer <= 0)
            return { x: 0, y: 0 };
        return {
            x: Math.sin(this.shakeTimer * 18) * 4,
            y: Math.cos(this.shakeTimer * 16) * 3,
        };
    }
    isInverted() {
        return this.invertWindow > 0;
    }
    buttonDrift(seed, alc) {
        if (this.invertWindow <= 0)
            return { dx: 0, dy: 0 };
        const over = Math.max(0, alc - Config_1.GAME_CONFIG.drunkChaos.flyThreshold);
        const ampX = Config_1.GAME_CONFIG.drunkChaos.flyAmpBaseX + over * Config_1.GAME_CONFIG.drunkChaos.flyAmpScaleX;
        const ampY = Config_1.GAME_CONFIG.drunkChaos.flyAmpBaseY + over * Config_1.GAME_CONFIG.drunkChaos.flyAmpScaleY;
        return {
            dx: Math.sin(seed + this.shakeTimer * 8) * ampX,
            dy: Math.cos(seed + this.shakeTimer * 6) * ampY,
        };
    }
}
exports.DrunkEffectSystem = DrunkEffectSystem;
