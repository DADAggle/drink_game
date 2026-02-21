"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyScene = void 0;
const Reducers_1 = require("../state/Reducers");
const Panel_1 = require("../ui/Panel");
const Toast_1 = require("../ui/Toast");
const ActionSystem_1 = require("../systems/ActionSystem");
const NpcSystem_1 = require("../systems/NpcSystem");
const DrunkEffectSystem_1 = require("../systems/DrunkEffectSystem");
const AssetLoader_1 = require("../systems/AssetLoader");
const Config_1 = require("../state/Config");
class PartyScene {
    constructor(shared) {
        this.shared = shared;
        this.action = new ActionSystem_1.ActionSystem();
        this.npc = new NpcSystem_1.NpcSystem();
        this.drunk = new DrunkEffectSystem_1.DrunkEffectSystem();
        this.toast = new Toast_1.Toast();
        this.assets = new AssetLoader_1.AssetLoader();
        this.tapQueue = [];
        this.dialog = null;
        this.dialogRects = [];
        this.phoneView = 'closed';
        this.phoneVolume = 3;
        this.videoVolumeRects = [];
        this.draggingVolumeSlider = false;
        this.spamTimer = 0;
        this.spamTaps = 0;
        this.layout();
        this.bootstrapAssets();
    }
    onEnter() {
        this.tapQueue = [];
        this.dialog = null;
        this.phoneView = 'closed';
        this.spamTimer = 0;
        this.spamTaps = 0;
        this.draggingVolumeSlider = false;
    }
    onExit() { }
    update(dt) {
        const state = this.shared.getState();
        (0, Reducers_1.stepState)(state, dt);
        this.drunk.update(state, dt);
        this.shared.audio.setDrunkLevel(state.stats.alc);
        if (this.phoneView === 'wechat' || this.phoneView === 'moments') {
            this.spamTimer = Math.max(0, this.spamTimer - dt);
            if (this.spamTimer <= 0) {
                if (this.phoneView === 'wechat') {
                    this.toast.push(this.action.harassSpam(state, this.spamTaps));
                }
                else {
                    this.toast.push(this.action.postSpam(state, this.spamTaps));
                }
                this.phoneView = 'menu';
            }
        }
        const qteResult = this.npc.update(state, dt);
        if (qteResult === 'win') {
            state.stats.score += 100;
            this.toast.push('拒酒成功 +100');
        }
        else if (qteResult === 'lose') {
            this.toast.push('拒酒失败，被灌了一杯');
            this.toast.push(this.action.drink(state));
        }
        this.toast.update(dt);
        this.flushTapQueue(state.now);
        const ending = (0, Reducers_1.checkEnding)(state);
        if (ending) {
            state.ending = ending;
            this.shared.sceneManager.switch('result', { state });
        }
    }
    render(ctx) {
        const state = this.shared.getState();
        const shake = this.drunk.getShakeOffset();
        ctx.save();
        ctx.clearRect(0, 0, this.shared.width, this.shared.height);
        this.renderBackground(ctx);
        ctx.translate(shake.x, shake.y);
        this.renderBackgroundNpc(ctx, state.stats.tol);
        this.renderTopHud(ctx);
        this.renderPlayer(ctx, state.stats.alc);
        this.renderNpc(ctx);
        this.renderMainButtons(ctx);
        this.renderDialog(ctx, state.stats.alc);
        this.renderQte(ctx);
        if (this.phoneView !== 'closed') {
            this.renderPhoneOverlay(ctx);
        }
        this.toast.render(ctx, 16, this.shared.height - 180);
        ctx.restore();
    }
    onTap(x, y) {
        const state = this.shared.getState();
        if (state.drunkFlags.delayInput) {
            this.tapQueue.push({ x, y, at: state.now + 0.12 });
            return;
        }
        this.handleTap(x, y);
    }
    onTouchMove(x, y) {
        if (this.phoneView === 'video' && this.draggingVolumeSlider) {
            this.setVolumeBySliderX(x);
            return;
        }
        if (this.phoneView === 'wechat' || this.phoneView === 'moments') {
            this.spamTaps += 1;
        }
    }
    onTouchEnd(_x, _y) {
        this.draggingVolumeSlider = false;
    }
    layout() {
        const w = this.shared.width;
        const h = this.shared.height;
        this.doorRect = { x: w - 122, y: 10, w: 106, h: 72 };
        this.drinkRect = { x: w - 132, y: h * 0.60, w: 112, h: 72 };
        this.phoneRect = { x: w - 132, y: h * 0.72, w: 112, h: 72 };
        this.pretendRect = { x: w - 132, y: h * 0.84, w: 112, h: 72 };
        this.npcRect = { x: 16, y: h * 0.30, w: 170, h: 220 };
        const phoneX = 18;
        const phoneY = h * 0.14;
        const phoneW = w - 36;
        const phoneH = h * 0.74;
        this.phoneCloseRect = { x: phoneX + phoneW - 62, y: phoneY + 12, w: 42, h: 28 };
        this.phoneMenuRects = {
            video: { x: phoneX + 24, y: phoneY + 90, w: phoneW - 48, h: 84 },
            wechat: { x: phoneX + 24, y: phoneY + 198, w: phoneW - 48, h: 84 },
            moments: { x: phoneX + 24, y: phoneY + 306, w: phoneW - 48, h: 84 },
        };
        this.videoVolumeRects = [];
        for (let i = 0; i < 5; i += 1) {
            this.videoVolumeRects.push({ x: phoneX + 28 + i * 54, y: phoneY + 220, w: 44, h: 40 });
        }
        this.videoSliderRect = { x: phoneX + 24, y: phoneY + 212, w: phoneW - 48, h: 20 };
        this.videoPlayRect = { x: phoneX + 24, y: phoneY + 292, w: phoneW - 48, h: 60 };
    }
    bootstrapAssets() {
        this.assets.register('bg', 'assets/images/bg_party.png');
        this.assets.register('door', 'assets/images/icon_door.png');
        this.assets.register('drink', 'assets/images/icon_drink.png');
        this.assets.register('phone', 'assets/images/icon_phone.png');
        this.assets.register('pretend', 'assets/images/icon_pretend.png');
        this.assets.register('npcTalk', 'assets/images/npc_talk.png');
        this.assets.register('npcBgNormal', 'assets/images/npc_bg_normal.png');
        this.assets.register('npcBgAnnoyed', 'assets/images/npc_bg_annoyed.png');
        this.assets.register('npcBgDisgust', 'assets/images/npc_bg_disgust.png');
        this.assets.register('player', 'assets/images/player_avatar.png');
        this.assets.register('video', 'assets/images/icon_video.png');
        this.assets.register('wechat', 'assets/images/icon_wechat.png');
        this.assets.register('moments', 'assets/images/icon_moments.png');
    }
    flushTapQueue(now) {
        if (this.tapQueue.length === 0)
            return;
        const due = this.tapQueue.filter((t) => t.at <= now);
        this.tapQueue = this.tapQueue.filter((t) => t.at > now);
        due.forEach((t) => this.handleTap(t.x, t.y));
    }
    handleTap(rawX, rawY) {
        const state = this.shared.getState();
        const x = this.drunk.isInverted() ? this.shared.width - rawX : rawX;
        const y = rawY;
        if (this.phoneView !== 'closed') {
            this.handlePhoneTap(x, y);
            return;
        }
        if (this.npc.qte.active) {
            this.npc.tapQte();
            return;
        }
        if (this.dialog) {
            for (let i = 0; i < this.dialogRects.length; i += 1) {
                const r = this.dialogRects[i];
                if (this.hitRect(r, x, y)) {
                    const msg = this.action.dialogAnswer(state, i === this.dialog.correctIndex);
                    this.toast.push(msg);
                    this.dialog = null;
                    return;
                }
            }
        }
        if (this.hitRect(this.npcRect, x, y) && state.unlocks.npcDialog) {
            this.dialog = this.npc.randomDialog();
            return;
        }
        if (this.hitRect(this.withDrift(this.doorRect, 1), x, y)) {
            this.shared.sceneManager.switch('balance', { state });
            return;
        }
        if (this.hitRect(this.withDrift(this.drinkRect, 2), x, y)) {
            this.toast.push(this.action.drink(state));
            return;
        }
        if (this.hitRect(this.withDrift(this.phoneRect, 3), x, y)) {
            if (state.unlocks.phone) {
                this.phoneView = 'menu';
            }
            else {
                this.toast.push('酒精达到25后解锁手机');
            }
            return;
        }
        if (this.hitRect(this.withDrift(this.pretendRect, 4), x, y)) {
            this.toast.push(this.action.pretend(state));
        }
    }
    handlePhoneTap(x, y) {
        const state = this.shared.getState();
        if (this.hitRect(this.phoneCloseRect, x, y)) {
            this.phoneView = 'closed';
            return;
        }
        if (this.phoneView === 'menu') {
            const canWechat = state.unlocks.harass;
            const canMoments = state.unlocks.post;
            if (this.hitRect(this.phoneMenuRects.video, x, y)) {
                this.phoneView = 'video';
                return;
            }
            if (this.hitRect(this.phoneMenuRects.wechat, x, y) && canWechat) {
                this.phoneView = 'wechat';
                this.spamTimer = Config_1.GAME_CONFIG.phoneMiniGame.spamDurationSec;
                this.spamTaps = 0;
                return;
            }
            if (this.hitRect(this.phoneMenuRects.wechat, x, y) && !canWechat) {
                this.toast.push('酒精达到40后解锁微信骚扰');
                return;
            }
            if (this.hitRect(this.phoneMenuRects.moments, x, y) && canMoments) {
                this.phoneView = 'moments';
                this.spamTimer = Config_1.GAME_CONFIG.phoneMiniGame.spamDurationSec;
                this.spamTaps = 0;
                return;
            }
            if (this.hitRect(this.phoneMenuRects.moments, x, y) && !canMoments) {
                this.toast.push('酒精达到55后解锁朋友圈轰炸');
            }
            return;
        }
        if (this.phoneView === 'video') {
            for (let i = 0; i < this.videoVolumeRects.length; i += 1) {
                if (this.hitRect(this.videoVolumeRects[i], x, y)) {
                    this.phoneVolume = i + 1;
                    this.draggingVolumeSlider = true;
                    this.setVolumeBySliderX(this.videoVolumeRects[i].x + this.videoVolumeRects[i].w / 2);
                    return;
                }
            }
            if (this.hitRect(this.videoSliderRect, x, y)) {
                this.draggingVolumeSlider = true;
                this.setVolumeBySliderX(x);
                return;
            }
            if (this.hitRect(this.videoPlayRect, x, y)) {
                this.toast.push(this.action.phone(state, this.phoneVolume));
                this.phoneView = 'menu';
                this.draggingVolumeSlider = false;
            }
            return;
        }
        if (this.phoneView === 'wechat' || this.phoneView === 'moments') {
            this.spamTaps += 1;
        }
    }
    renderBackground(ctx) {
        if (this.assets.isReady('bg')) {
            const img = this.assets.get('bg');
            this.drawImageCover(ctx, img, 0, 0, this.shared.width, this.shared.height);
        }
        else {
            ctx.fillStyle = '#334455';
            ctx.fillRect(0, 0, this.shared.width, this.shared.height);
        }
        Panel_1.Panel.draw(ctx, { x: 0, y: 0, w: this.shared.width, h: this.shared.height }, '#000000', 0.38);
    }
    renderMainButtons(ctx) {
        const state = this.shared.getState();
        this.drawImageButton(ctx, this.withDrift(this.doorRect, 1), 'door', '门口', true);
        this.renderDoorTimer(ctx, state.timeLeft, this.withDrift(this.doorRect, 1));
        this.drawImageButton(ctx, this.withDrift(this.drinkRect, 2), 'drink', '喝酒', true);
        this.drawImageButton(ctx, this.withDrift(this.phoneRect, 3), 'phone', '手机', state.unlocks.phone);
        this.drawImageButton(ctx, this.withDrift(this.pretendRect, 4), 'pretend', '假装正常', true);
    }
    renderTopHud(ctx) {
        const state = this.shared.getState();
        Panel_1.Panel.draw(ctx, { x: 12, y: 12, w: 272, h: 156 }, '#111111');
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px sans-serif';
        this.renderStatBar(ctx, '心情', state.stats.mood / 100, 20, 30, false);
        this.renderStatBar(ctx, '酒精', state.stats.alc / 100, 20, 56, true);
        this.renderStatBar(ctx, '容忍', state.stats.tol / 100, 20, 82, false);
        this.renderStatBar(ctx, '羞耻', state.stats.shame / 100, 20, 108, true);
        this.renderStatBar(ctx, '积分', Math.min(1, state.stats.score / 1200), 20, 134, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText(Config_1.GAME_CONFIG.title, 206, 16);
        if (state.cooldowns.pretend > 0) {
            ctx.fillText(`假装CD: ${state.cooldowns.pretend.toFixed(1)}s`, 206, 34);
        }
    }
    renderBackgroundNpc(ctx, tol) {
        let face = ':)';
        let key = 'npcBgNormal';
        if (tol < 60 && tol >= 30) {
            face = ':|';
            key = 'npcBgAnnoyed';
        }
        if (tol < 30) {
            face = ':(';
            key = 'npcBgDisgust';
        }
        for (let i = 0; i < 3; i += 1) {
            const x = 186 + i * 56;
            const y = 222 + (i % 2) * 92;
            const rect = { x, y, w: 56, h: 106 };
            Panel_1.Panel.draw(ctx, { x: rect.x - 2, y: rect.y - 2, w: rect.w + 4, h: rect.h + 4 }, '#0b0b0b', 0.36);
            if (this.assets.isReady(key)) {
                this.drawImageContain(ctx, this.assets.get(key), rect);
            }
            else {
                ctx.fillStyle = '#7f8f9b';
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillText(face, rect.x + 14, rect.y + 58);
        }
    }
    renderNpc(ctx) {
        Panel_1.Panel.draw(ctx, { x: this.npcRect.x - 4, y: this.npcRect.y - 4, w: this.npcRect.w + 8, h: this.npcRect.h + 8 }, '#0b0b0b', 0.4);
        if (this.assets.isReady('npcTalk')) {
            this.drawImageContain(ctx, this.assets.get('npcTalk'), this.npcRect);
        }
        else {
            ctx.fillStyle = '#d8b38a';
            ctx.fillRect(this.npcRect.x, this.npcRect.y, this.npcRect.w, this.npcRect.h);
        }
        ctx.fillStyle = '#202020';
        ctx.fillText('朋友NPC', this.npcRect.x + 20, this.npcRect.y + 20);
        ctx.fillText('点击对话', this.npcRect.x + 20, this.npcRect.y + 44);
    }
    renderPlayer(ctx, alc) {
        const h = this.shared.height;
        const x = 18;
        const y = h - 130;
        Panel_1.Panel.draw(ctx, { x, y, w: 150, h: 102 }, '#121212', 0.85);
        if (this.assets.isReady('player')) {
            ctx.drawImage(this.assets.get('player'), x + 14, y + 18, 64, 64);
        }
        else {
            const red = Math.min(255, 120 + Math.floor(alc * 1.2));
            ctx.fillStyle = `rgb(${red},110,110)`;
            ctx.fillRect(x + 16, y + 20, 60, 60);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillText('玩家', x + 92, y + 54);
    }
    renderDialog(ctx, alc) {
        if (!this.dialog) {
            this.dialogRects = [];
            return;
        }
        const d = this.dialog;
        const x = 20;
        const y = this.shared.height * 0.56;
        const w = this.shared.width - 160;
        Panel_1.Panel.draw(ctx, { x, y, w, h: 154 }, '#1e1e2f', 0.92);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.npc.garble(d.prompt, alc), x + 10, y + 24);
        this.dialogRects = [];
        for (let i = 0; i < d.options.length; i += 1) {
            const rect = { x: x + 10, y: y + 42 + i * 36, w: w - 20, h: 30 };
            this.dialogRects.push(rect);
            Panel_1.Panel.draw(ctx, rect, '#3b4f6a', 0.95);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.npc.garble(`${i + 1}. ${d.options[i]}`, alc), rect.x + 8, rect.y + 20);
        }
    }
    renderQte(ctx) {
        if (!this.npc.qte.active)
            return;
        Panel_1.Panel.draw(ctx, { x: 24, y: 130, w: this.shared.width - 48, h: 74 }, '#5a2f2f', 0.9);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NPC劝酒中！连点屏幕拒绝', 36, 158);
        ctx.fillText(`进度: ${this.npc.qte.taps}/${this.npc.qte.need}  剩余: ${this.npc.qte.remaining.toFixed(1)}s`, 36, 183);
    }
    renderPhoneOverlay(ctx) {
        const w = this.shared.width;
        const h = this.shared.height;
        const x = 18;
        const y = h * 0.14;
        const pw = w - 36;
        const ph = h * 0.74;
        Panel_1.Panel.draw(ctx, { x: 0, y: 0, w, h }, '#000000', 0.35);
        Panel_1.Panel.draw(ctx, { x, y, w: pw, h: ph }, '#0f1622', 0.98);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('手机', x + 14, y + 30);
        this.drawImageButton(ctx, this.phoneCloseRect, 'pretend', '返回', true);
        const state = this.shared.getState();
        ctx.font = '13px sans-serif';
        ctx.fillText(`酒精:${this.levelText(state.stats.alc / 100, true)}  容忍:${this.levelText(state.stats.tol / 100, false)}  音量:${this.phoneVolume}档`, x + 14, y + 54);
        if (this.phoneView === 'menu') {
            this.drawImageButton(ctx, this.phoneMenuRects.video, 'video', '短视频', true);
            this.drawImageButton(ctx, this.phoneMenuRects.wechat, 'wechat', '微信骚扰', state.unlocks.harass);
            this.drawImageButton(ctx, this.phoneMenuRects.moments, 'moments', '朋友圈轰炸', state.unlocks.post);
            ctx.fillText('选择一个功能进入', x + 14, y + ph - 20);
            return;
        }
        if (this.phoneView === 'video') {
            ctx.font = '16px sans-serif';
            ctx.fillText('短视频外放：拖动音量条后播放', x + 18, y + 120);
            this.renderVolumeSlider(ctx);
            for (let i = 0; i < this.videoVolumeRects.length; i += 1) {
                const rect = this.videoVolumeRects[i];
                const selected = i + 1 === this.phoneVolume;
                Panel_1.Panel.draw(ctx, rect, selected ? '#4a88cc' : '#304050', 0.95);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(String(i + 1), rect.x + 16, rect.y + 25);
            }
            this.drawImageButton(ctx, this.videoPlayRect, 'video', `播放（音量${this.phoneVolume}）`, true);
            return;
        }
        if (this.phoneView === 'wechat' || this.phoneView === 'moments') {
            const title = this.phoneView === 'wechat' ? '微信骚扰模式' : '朋友圈轰炸模式';
            ctx.font = '18px sans-serif';
            ctx.fillText(title, x + 18, y + 120);
            ctx.font = '15px sans-serif';
            ctx.fillText('疯狂点击屏幕发消息，时间到自动结算', x + 18, y + 152);
            ctx.fillText(`剩余 ${this.spamTimer.toFixed(1)}s`, x + 18, y + 186);
            ctx.fillText(`已点击 ${this.spamTaps} 次`, x + 18, y + 216);
            Panel_1.Panel.draw(ctx, { x: x + 18, y: y + 250, w: pw - 36, h: ph - 290 }, '#1a2738', 0.9);
            ctx.fillStyle = '#8fd7ff';
            ctx.fillText('在这里连点', x + pw / 2 - 28, y + ph / 2);
        }
    }
    withDrift(rect, seed) {
        const state = this.shared.getState();
        if (!state.drunkFlags.flyButtons)
            return rect;
        const drift = this.drunk.buttonDrift(seed, state.stats.alc);
        return { x: rect.x + drift.dx, y: rect.y + drift.dy, w: rect.w, h: rect.h };
    }
    hitRect(rect, x, y) {
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }
    drawImageButton(ctx, rect, imageKey, label, enabled) {
        ctx.save();
        ctx.globalAlpha = enabled ? 1 : 0.45;
        Panel_1.Panel.draw(ctx, { x: rect.x - 6, y: rect.y - 6, w: rect.w + 12, h: rect.h + 12 }, '#0a0a0a', 0.52);
        if (this.assets.isReady(imageKey)) {
            const img = this.assets.get(imageKey);
            this.drawImageContain(ctx, img, rect);
        }
        else {
            Panel_1.Panel.draw(ctx, rect, '#425066', 1);
        }
        ctx.strokeStyle = '#e8eff8';
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.restore();
    }
    renderVolumeSlider(ctx) {
        const r = this.videoSliderRect;
        Panel_1.Panel.draw(ctx, r, '#233245', 0.95);
        ctx.strokeStyle = '#a5b8cf';
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        for (let i = 0; i < 5; i += 1) {
            const tx = r.x + (r.w / 4) * i;
            ctx.strokeStyle = '#8da4bd';
            ctx.beginPath();
            ctx.moveTo(tx, r.y);
            ctx.lineTo(tx, r.y + r.h);
            ctx.stroke();
        }
        const t = (this.phoneVolume - 1) / 4;
        const knobX = r.x + t * r.w;
        Panel_1.Panel.draw(ctx, { x: knobX - 8, y: r.y - 6, w: 16, h: r.h + 12 }, '#5ab1ff', 1);
    }
    renderStatBar(ctx, label, rateRaw, x, y, dangerHigh) {
        const rate = Math.max(0, Math.min(1, rateRaw));
        const barX = x + 42;
        const barY = y - 10;
        const barW = 152;
        const barH = 12;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x, y);
        Panel_1.Panel.draw(ctx, { x: barX, y: barY, w: barW, h: barH }, '#283342', 1);
        ctx.fillStyle = this.levelColor(rate, dangerHigh);
        ctx.fillRect(barX + 1, barY + 1, (barW - 2) * rate, barH - 2);
        ctx.strokeStyle = '#d0d0d0';
        ctx.strokeRect(barX, barY, barW, barH);
    }
    renderDoorTimer(ctx, timeLeft, doorRect) {
        const timerRect = { x: doorRect.x, y: doorRect.y + doorRect.h + 6, w: doorRect.w, h: 26 };
        Panel_1.Panel.draw(ctx, timerRect, '#0b0b0b', 0.72);
        ctx.strokeStyle = '#d0d0d0';
        ctx.strokeRect(timerRect.x, timerRect.y, timerRect.w, timerRect.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '17px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.formatCountdown(timeLeft), timerRect.x + timerRect.w / 2, timerRect.y + timerRect.h / 2);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }
    levelColor(rate, dangerHigh) {
        if (dangerHigh) {
            if (rate < 0.35)
                return '#2ab36c';
            if (rate < 0.7)
                return '#e0b13d';
            return '#d24b4b';
        }
        if (rate < 0.35)
            return '#d24b4b';
        if (rate < 0.7)
            return '#e0b13d';
        return '#2ab36c';
    }
    levelText(rate, dangerHigh) {
        if (dangerHigh) {
            if (rate < 0.35)
                return '低';
            if (rate < 0.7)
                return '中';
            return '高';
        }
        if (rate < 0.35)
            return '低';
        if (rate < 0.7)
            return '中';
        return '高';
    }
    formatCountdown(timeLeft) {
        const totalSec = Math.max(0, Math.floor(timeLeft));
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        const mm = min < 10 ? `0${min}` : `${min}`;
        const ss = sec < 10 ? `0${sec}` : `${sec}`;
        return `${mm}:${ss}`;
    }
    setVolumeBySliderX(x) {
        const r = this.videoSliderRect;
        const clampedX = Math.max(r.x, Math.min(r.x + r.w, x));
        const ratio = (clampedX - r.x) / r.w;
        const level = Math.round(ratio * 4) + 1;
        this.phoneVolume = Math.max(1, Math.min(5, level));
    }
    drawImageContain(ctx, image, rect) {
        const iw = image.width || rect.w;
        const ih = image.height || rect.h;
        if (iw <= 0 || ih <= 0) {
            ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
            return;
        }
        const scale = Math.min(rect.w / iw, rect.h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = rect.x + (rect.w - dw) / 2;
        const dy = rect.y + (rect.h - dh) / 2;
        ctx.drawImage(image, dx, dy, dw, dh);
    }
    drawImageCover(ctx, image, x, y, w, h) {
        const iw = image.width || w;
        const ih = image.height || h;
        if (iw <= 0 || ih <= 0) {
            ctx.drawImage(image, x, y, w, h);
            return;
        }
        const scale = Math.max(w / iw, h / ih);
        const sw = w / scale;
        const sh = h / scale;
        const sx = (iw - sw) / 2;
        const sy = (ih - sh) / 2;
        ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    }
}
exports.PartyScene = PartyScene;
