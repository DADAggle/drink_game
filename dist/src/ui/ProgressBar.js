"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
class ProgressBar {
    constructor(rect, color) {
        this.rect = rect;
        this.color = color;
    }
    render(ctx, rate, label) {
        const clamped = Math.max(0, Math.min(1, rate));
        ctx.save();
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w * clamped, this.rect.h);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText(label, this.rect.x + 6, this.rect.y + this.rect.h - 6);
        ctx.restore();
    }
}
exports.ProgressBar = ProgressBar;
