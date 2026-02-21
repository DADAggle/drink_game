"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioSystem = void 0;
class AudioSystem {
    constructor() {
        this.bgm = null;
        this.initialized = false;
    }
    startBgm() {
        if (this.initialized)
            return;
        this.initialized = true;
        try {
            this.bgm = wx.createInnerAudioContext();
            this.bgm.loop = true;
            this.bgm.autoplay = false;
            this.bgm.src = 'assets/bgm.mp3';
            this.bgm.volume = 0.3;
            this.bgm.play();
        }
        catch (_) {
            // simulator without audio file
        }
    }
    setDrunkLevel(level) {
        if (!this.bgm)
            return;
        this.bgm.volume = Math.max(0.2, Math.min(0.8, 0.3 + level * 0.003));
    }
    sfx(_name) {
        // Placeholder for MVP: one-shot effects can be attached later.
    }
}
exports.AudioSystem = AudioSystem;
