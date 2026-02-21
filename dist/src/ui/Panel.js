"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
class Panel {
    static draw(ctx, rect, color, alpha = 0.8) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
    }
}
exports.Panel = Panel;
