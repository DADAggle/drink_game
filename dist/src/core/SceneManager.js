"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
class SceneManager {
    constructor(factory, initial) {
        this.factory = factory;
        this.currentScene = this.factory(initial);
        this.currentScene.onEnter();
    }
    switch(name, payload) {
        this.currentScene.onExit();
        this.currentScene = this.factory(name);
        this.currentScene.onEnter(payload);
    }
    update(dt) {
        this.currentScene.update(dt);
    }
    render(ctx) {
        this.currentScene.render(ctx);
    }
    onTap(x, y) {
        this.currentScene.onTap(x, y);
    }
    onTouchMove(x, y) {
        var _a, _b;
        (_b = (_a = this.currentScene).onTouchMove) === null || _b === void 0 ? void 0 : _b.call(_a, x, y);
    }
    onTouchEnd(x, y) {
        var _a, _b;
        (_b = (_a = this.currentScene).onTouchEnd) === null || _b === void 0 ? void 0 : _b.call(_a, x, y);
    }
}
exports.SceneManager = SceneManager;
