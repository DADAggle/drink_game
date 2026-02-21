"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
class Input {
    constructor() {
        this.tapHandlers = [];
        this.moveHandlers = [];
        this.endHandlers = [];
    }
    start() {
        wx.onTouchStart((e) => {
            const touch = e.touches && e.touches[0];
            if (!touch)
                return;
            const event = { x: touch.clientX, y: touch.clientY };
            this.tapHandlers.forEach((h) => h(event));
        });
        wx.onTouchMove((e) => {
            const touch = e.touches && e.touches[0];
            if (!touch)
                return;
            const event = { x: touch.clientX, y: touch.clientY };
            this.moveHandlers.forEach((h) => h(event));
        });
        wx.onTouchEnd((e) => {
            const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
            if (!touch)
                return;
            const event = { x: touch.clientX, y: touch.clientY };
            this.endHandlers.forEach((h) => h(event));
        });
    }
    onTap(handler) {
        this.tapHandlers.push(handler);
    }
    onMove(handler) {
        this.moveHandlers.push(handler);
    }
    onEnd(handler) {
        this.endHandlers.push(handler);
    }
}
exports.Input = Input;
