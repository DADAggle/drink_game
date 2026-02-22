"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultScene = void 0;
const Button_1 = require("../ui/Button");
const Config_1 = require("../state/Config");
const Reducers_1 = require("../state/Reducers");
const ResultContentGenerator_1 = require("../systems/ResultContentGenerator");
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
function easeOutCubic(t) {
    const k = 1 - t;
    return 1 - k * k * k;
}
class ResultScene {
    constructor(shared) {
        this.shared = shared;
        this.ending = 'timeup';
        this.revealTime = 0;
        this.calls = [];
        this.moments = [];
        this.title = '清醒路人';
        this.scrollY = 0;
        this.maxScroll = 0;
        this.dragging = false;
        this.lastTouchY = 0;
        this.restartBtn = new Button_1.Button({ x: this.shared.width / 2 - 100, y: this.shared.height - 98, w: 200, h: 56 }, '你还想再喝吗', true, '#3f3f3f');
    }
    onEnter(payload) {
        var _a, _b;
        const state = (_a = payload === null || payload === void 0 ? void 0 : payload.state) !== null && _a !== void 0 ? _a : this.shared.getState();
        this.shared.setState(state);
        this.state = state;
        this.ending = (_b = state.ending) !== null && _b !== void 0 ? _b : 'timeup';
        this.revealTime = 0;
        this.scrollY = 0;
        this.maxScroll = 0;
        this.dragging = false;
        this.title = (0, Reducers_1.titleByShame)(state.stats.shame);
        const profile = this.shared.getProfile();
        if (state.stats.score > profile.bestScore) {
            this.shared.saveProfile({ bestScore: state.stats.score, bestTitle: this.title });
        }
        const seed = Math.floor(state.now * 1000) + Math.floor(state.stats.score) * 7 + Math.floor(state.stats.shame) * 13;
        this.calls = (0, ResultContentGenerator_1.generateCallBomb)(state.counters.harass, seed);
        this.moments = (0, ResultContentGenerator_1.generateMoments)(state.counters.post, seed + 97);
    }
    onExit() { }
    update(dt) {
        this.revealTime += dt;
    }
    render(ctx) {
        const w = this.shared.width;
        const h = this.shared.height;
        ctx.clearRect(0, 0, w, h);
        this.drawBackdrop(ctx, w, h);
        const paper = this.paperRect(w, h);
        this.drawPaperShadow(ctx, paper);
        const trans = this.paperTransform(w, h);
        ctx.save();
        ctx.translate(trans.cx, trans.cy);
        ctx.rotate(trans.rot);
        ctx.translate(-paper.w / 2, -paper.h / 2);
        const localPaper = { x: 0, y: 0, w: paper.w, h: paper.h };
        this.drawPaper(ctx, localPaper);
        this.drawMasthead(ctx, localPaper);
        const viewport = {
            x: 18,
            y: 132,
            w: localPaper.w - 36,
            h: localPaper.h - 228,
        };
        const contentHeight = this.measureContentHeight(viewport.w);
        this.maxScroll = Math.max(0, contentHeight - viewport.h);
        this.scrollY = clamp(this.scrollY, 0, this.maxScroll);
        this.drawScrollableContent(ctx, viewport);
        this.drawFooterMeta(ctx, localPaper);
        if (this.maxScroll > 0 && this.revealTime > 0.9) {
            this.drawScrollHint(ctx, viewport);
        }
        ctx.restore();
        if (this.revealTime > 1.1) {
            this.restartBtn.render(ctx);
        }
    }
    onTap(x, y) {
        if (this.revealTime > 1.1 && this.restartBtn.contains(x, y)) {
            this.shared.restart();
            return;
        }
        const paper = this.paperRect(this.shared.width, this.shared.height);
        const inPaper = x >= paper.x && x <= paper.x + paper.w && y >= paper.y && y <= paper.y + paper.h;
        if (inPaper) {
            this.dragging = true;
            this.lastTouchY = y;
        }
    }
    onTouchMove(_x, y) {
        if (!this.dragging || this.maxScroll <= 0 || this.revealTime < 0.5)
            return;
        const delta = y - this.lastTouchY;
        this.lastTouchY = y;
        this.scrollY = clamp(this.scrollY - delta, 0, this.maxScroll);
    }
    onTouchEnd(_x, _y) {
        this.dragging = false;
    }
    paperRect(w, h) {
        const pw = Math.min(430, w - 26);
        const ph = h - 130;
        return { x: (w - pw) / 2, y: h / 2 - ph / 2 - 10, w: pw, h: ph };
    }
    paperTransform(w, h) {
        const paper = this.paperRect(w, h);
        const finalX = paper.x + paper.w / 2;
        const finalY = paper.y + paper.h / 2;
        const t = clamp(this.revealTime / 0.42, 0, 1);
        const eased = easeOutCubic(t);
        const startY = -paper.h * 0.65;
        const overshoot = Math.sin(Math.min(1, this.revealTime / 0.5) * Math.PI) * 12;
        const cy = startY + (finalY - startY) * eased + overshoot;
        const rot = (-0.16 + 0.16 * eased) * (1 - clamp((this.revealTime - 0.45) / 0.4, 0, 1));
        return { cx: finalX, cy, rot };
    }
    drawBackdrop(ctx, w, h) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1f2333');
        grad.addColorStop(1, '#10131d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 18; i += 1) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect((i * 67) % w, (i * 91) % h, 2, 2);
        }
        ctx.globalAlpha = 1;
    }
    drawPaperShadow(ctx, paper) {
        ctx.fillStyle = 'rgba(0,0,0,0.34)';
        ctx.fillRect(paper.x + 6, paper.y + 8, paper.w, paper.h);
    }
    drawPaper(ctx, paper) {
        ctx.fillStyle = '#ece3c9';
        ctx.fillRect(paper.x, paper.y, paper.w, paper.h);
        ctx.strokeStyle = '#484236';
        ctx.lineWidth = 2;
        ctx.strokeRect(paper.x, paper.y, paper.w, paper.h);
        ctx.lineWidth = 1;
        ctx.strokeRect(paper.x + 6, paper.y + 6, paper.w - 12, paper.h - 12);
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 120; i += 1) {
            ctx.fillStyle = i % 2 === 0 ? '#7a6f57' : '#9a8e70';
            ctx.fillRect((i * 37) % paper.w, (i * 29) % paper.h, 2, 2);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(70,64,51,0.25)';
        ctx.beginPath();
        ctx.moveTo(paper.w * 0.48, 0);
        ctx.lineTo(paper.w * 0.54, paper.h);
        ctx.stroke();
    }
    drawMasthead(ctx, paper) {
        const x = paper.x + 16;
        let y = paper.y + 34;
        ctx.fillStyle = '#121212';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(Config_1.GAME_CONFIG.title, x, y);
        y += 18;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('您昨晚做了什么', x, y + 8);
        ctx.fillStyle = '#8d1e1e';
        ctx.fillRect(paper.w - 140, 18, 112, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('醉酒晚报 · 特刊', paper.w - 132, 36);
        ctx.strokeStyle = '#111111';
        ctx.beginPath();
        ctx.moveTo(x, 88);
        ctx.lineTo(paper.w - 16, 88);
        ctx.stroke();
    }
    drawScrollableContent(ctx, viewport) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        ctx.clip();
        ctx.translate(0, -this.scrollY);
        let y = viewport.y + 14;
        const x = viewport.x;
        this.section(ctx, 0.24, () => {
            ctx.fillStyle = '#111111';
            ctx.fillRect(x, y - 22, viewport.w, 44);
            ctx.fillStyle = '#f4ead3';
            ctx.font = 'bold 27px sans-serif';
            ctx.fillText((0, Reducers_1.endingText)(this.ending), x + 10, y + 8);
            y += 34;
            ctx.fillStyle = '#111111';
            ctx.font = '16px sans-serif';
            ctx.fillText(`积分：${this.state.stats.score.toFixed(0)}    羞耻值：${this.state.stats.shame.toFixed(0)}`, x, y);
            y += 26;
            ctx.font = 'bold 25px sans-serif';
            ctx.fillStyle = '#7a1f1f';
            ctx.fillText(`称号：${this.title}`, x, y);
            y += 30;
        });
        this.section(ctx, 0.36, () => {
            ctx.fillStyle = '#222222';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('行为统计', x, y);
            y += 20;
            ctx.font = '15px sans-serif';
            ctx.fillText(`喝酒 ${this.state.counters.drink} 次  |  外放视频 ${this.state.counters.phone} 次`, x, y);
            y += 18;
            ctx.fillText(`骚扰电话 ${this.state.counters.harass} 次  |  发朋友圈 ${this.state.counters.post} 次`, x, y);
            y += 20;
        });
        this.section(ctx, 0.52, () => {
            ctx.fillStyle = '#1c2f1c';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('骚扰电话实录', x, y);
            y += 8;
            y = this.drawCallBubbles(ctx, x, y, viewport.w);
            y += 10;
        });
        this.section(ctx, 0.72, () => {
            ctx.fillStyle = '#1f2a3a';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('朋友圈动态', x, y);
            y += 8;
            y = this.drawMoments(ctx, x, y, viewport.w);
            y += 8;
        });
        this.section(ctx, 0.9, () => {
            const profile = this.shared.getProfile();
            ctx.fillStyle = '#111111';
            ctx.font = '14px sans-serif';
            ctx.fillText(`拒酒成功/失败：${this.state.counters.qteWin}/${this.state.counters.qteLose}`, x, y);
            y += 18;
            ctx.fillText(`历史最高分：${profile.bestScore.toFixed(0)}（${profile.bestTitle}）`, x, y);
            if (this.state.stats.alc <= 20 && this.state.stats.shame <= 20) {
                y += 18;
                ctx.fillStyle = '#2e7d32';
                ctx.fillText('你没有逃避', x, y);
            }
        });
        ctx.restore();
    }
    drawFooterMeta(ctx, paper) {
        const y = paper.h - 74;
        ctx.strokeStyle = 'rgba(28,28,28,0.35)';
        ctx.beginPath();
        ctx.moveTo(16, y);
        ctx.lineTo(paper.w - 16, y);
        ctx.stroke();
        ctx.fillStyle = '#333333';
        ctx.font = '12px sans-serif';
        ctx.fillText('今日责任编辑：昨晚的你', 18, y + 22);
        ctx.fillText('版号：A-007', paper.w - 98, y + 22);
    }
    drawScrollHint(ctx, viewport) {
        const barX = viewport.x + viewport.w + 4;
        const barY = viewport.y;
        const barH = viewport.h;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(barX, barY, 4, barH);
        const handleH = Math.max(24, (barH / (barH + this.maxScroll)) * barH);
        const ratio = this.maxScroll <= 0 ? 0 : this.scrollY / this.maxScroll;
        const handleY = barY + (barH - handleH) * ratio;
        ctx.fillStyle = '#616161';
        ctx.fillRect(barX, handleY, 4, handleH);
        ctx.fillStyle = '#464646';
        ctx.font = '11px sans-serif';
        ctx.fillText('上滑查看', viewport.x + viewport.w - 60, viewport.y + viewport.h - 8);
    }
    drawCallBubbles(ctx, x, y, width) {
        const bubbleW = Math.floor(width * 0.78);
        const startX = x + width - bubbleW;
        for (let i = 0; i < this.calls.length; i += 1) {
            const msg = this.calls[i];
            const lines = this.wrapText(msg, 18);
            const bh = 12 + lines.length * 18;
            ctx.fillStyle = '#9de27f';
            ctx.fillRect(startX, y, bubbleW, bh);
            ctx.strokeStyle = '#77b65e';
            ctx.strokeRect(startX, y, bubbleW, bh);
            ctx.fillStyle = '#143312';
            ctx.font = '14px sans-serif';
            for (let j = 0; j < lines.length; j += 1) {
                ctx.fillText(lines[j], startX + 8, y + 18 + j * 16);
            }
            y += bh + 6;
        }
        return y;
    }
    drawMoments(ctx, x, y, width) {
        var _a;
        const cardH = 64;
        for (let i = 0; i < this.moments.length; i += 1) {
            const m = this.moments[i];
            ctx.fillStyle = '#f4f7fc';
            ctx.fillRect(x, y, width, cardH);
            ctx.strokeStyle = '#9aa8bf';
            ctx.strokeRect(x, y, width, cardH);
            ctx.fillStyle = '#20324a';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(`#${m.moodTag}`, x + 8, y + 16);
            ctx.font = '13px sans-serif';
            const line = (_a = this.wrapText(m.text, 28)[0]) !== null && _a !== void 0 ? _a : m.text;
            ctx.fillText(line, x + 8, y + 36);
            ctx.fillStyle = '#4b5f79';
            ctx.fillText(`赞 ${m.likes} · 评论 ${m.comments}`, x + 8, y + 54);
            y += cardH + 6;
        }
        return y;
    }
    wrapText(text, maxChars) {
        const lines = [];
        let cur = '';
        for (let i = 0; i < text.length; i += 1) {
            cur += text[i];
            if (cur.length >= maxChars || i === text.length - 1) {
                lines.push(cur);
                cur = '';
            }
        }
        return lines;
    }
    measureContentHeight(width) {
        let y = 0;
        y += 34 + 26 + 30;
        y += 20 + 18 + 20;
        y += 8;
        const callBubbleW = Math.floor(width * 0.78);
        const callChars = Math.max(10, Math.floor((callBubbleW - 16) / 14));
        for (let i = 0; i < this.calls.length; i += 1) {
            const lines = this.wrapText(this.calls[i], callChars);
            y += 12 + lines.length * 18 + 6;
        }
        y += 10;
        y += 8;
        y += this.moments.length * (64 + 6);
        y += 8;
        y += 18 + 18 + 18;
        return y + 20;
    }
    section(ctx, delay, draw) {
        const alpha = clamp((this.revealTime - delay) / 0.25, 0, 1);
        if (alpha <= 0)
            return;
        ctx.save();
        ctx.globalAlpha = alpha;
        draw();
        ctx.restore();
    }
}
exports.ResultScene = ResultScene;
