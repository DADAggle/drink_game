"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
class Button {
    constructor(rect, label, enabled = true, color = '#4a90e2') {
        this.rect = rect;
        this.label = label;
        this.enabled = enabled;
        this.color = color;
    }
    contains(x, y) {
        return (x >= this.rect.x &&
            x <= this.rect.x + this.rect.w &&
            y >= this.rect.y &&
            y <= this.rect.y + this.rect.h);
    }
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.enabled ? 1 : 0.4;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px sans-serif';
        ctx.fillText(this.label, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h / 2);
        ctx.restore();
    }
}
exports.Button = Button;
