"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceScene = void 0;
const Config_1 = require("../state/Config");
class BalanceScene {
    constructor(shared) {
        this.shared = shared;
        this.pointer = 0;
        this.velocity = 0;
        this.timeLeft = Config_1.GAME_CONFIG.balance.duration;
        this.finished = false;
    }
    onEnter(payload) {
        const p = payload;
        if (p === null || p === void 0 ? void 0 : p.state) {
            this.shared.setState(p.state);
        }
        this.pointer = 0;
        this.velocity = 0;
        this.timeLeft = Config_1.GAME_CONFIG.balance.duration;
        this.finished = false;
    }
    onExit() { }
    update(dt) {
        if (this.finished)
            return;
        const state = this.shared.getState();
        const difficulty = Config_1.GAME_CONFIG.balance.baseDrift + state.stats.alc * Config_1.GAME_CONFIG.balance.alcDriftFactor;
        const randomAccel = (Math.random() - 0.5) * (1.5 + difficulty * 1.4);
        const outwardAccel = this.pointer * (0.7 + difficulty * 0.28);
        this.velocity += (randomAccel + outwardAccel) * dt;
        this.pointer += this.velocity * dt;
        this.velocity *= 0.986;
        this.timeLeft -= dt;
        if (Math.abs(this.pointer) > 1) {
            state.ending = 'street';
            this.finished = true;
            this.shared.sceneManager.switch('result', { state });
            return;
        }
        if (this.timeLeft <= 0) {
            state.ending = 'home';
            this.finished = true;
            this.shared.sceneManager.switch('result', { state });
        }
    }
    render(ctx) {
        const w = this.shared.width;
        const h = this.shared.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#102433';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('回家平衡挑战', 20, 40);
        ctx.font = '14px sans-serif';
        ctx.fillText('点击左半屏向左修正，点击右半屏向右修正', 20, 64);
        ctx.fillText(`剩余 ${this.timeLeft.toFixed(1)}s`, 20, 86);
        const barX = 30;
        const barY = h * 0.55;
        const barW = w - 60;
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barW, 12);
        const safeW = (barW * Config_1.GAME_CONFIG.balance.safeRange) / 2;
        ctx.fillStyle = '#2f8f62';
        ctx.fillRect(barX + barW / 2 - safeW, barY - 8, safeW * 2, 28);
        const pointerX = barX + ((this.pointer + 1) / 2) * barW;
        ctx.fillStyle = '#ffcc55';
        ctx.fillRect(pointerX - 4, barY - 18, 8, 48);
    }
    onTap(x, _y) {
        if (this.finished)
            return;
        const state = this.shared.getState();
        const control = Math.max(Config_1.GAME_CONFIG.balance.controlMin, Config_1.GAME_CONFIG.balance.controlBase - state.stats.alc * Config_1.GAME_CONFIG.balance.controlDecayByAlc);
        if (x < this.shared.width / 2) {
            this.velocity -= control;
            return;
        }
        this.velocity += control;
    }
}
exports.BalanceScene = BalanceScene;
