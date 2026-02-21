"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoader = void 0;
class AssetLoader {
    constructor() {
        this.images = {};
        this.ready = {};
    }
    register(key, src) {
        if (this.images[key])
            return;
        const img = wx.createImage();
        this.images[key] = img;
        this.ready[key] = false;
        img.onload = () => {
            this.ready[key] = true;
        };
        img.onerror = () => {
            this.ready[key] = false;
        };
        img.src = src;
    }
    get(key) {
        if (!this.images[key])
            return null;
        return this.images[key];
    }
    isReady(key) {
        return Boolean(this.ready[key]);
    }
}
exports.AssetLoader = AssetLoader;
