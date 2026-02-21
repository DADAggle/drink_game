"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticker = void 0;
class Ticker {
    constructor(onTick) {
        this.onTick = onTick;
        this.running = false;
        this.last = 0;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.last = Date.now();
        this.loop();
    }
    stop() {
        this.running = false;
    }
    loop() {
        if (!this.running)
            return;
        const now = Date.now();
        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        this.onTick(dt);
        requestAnimationFrame(() => this.loop());
    }
}
exports.Ticker = Ticker;
