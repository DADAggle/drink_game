"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultScene = void 0;
const Button_1 = require("../ui/Button");
const Config_1 = require("../state/Config");
const Reducers_1 = require("../state/Reducers");
class ResultScene {
    constructor(shared) {
        this.shared = shared;
        this.ending = 'timeup';
        this.restartBtn = new Button_1.Button({ x: this.shared.width / 2 - 80, y: this.shared.height - 120, w: 160, h: 52 }, '你还想再喝吗');
    }
    onEnter(payload) {
        var _a, _b;
        const state = (_a = payload === null || payload === void 0 ? void 0 : payload.state) !== null && _a !== void 0 ? _a : this.shared.getState();
        this.shared.setState(state);
        this.ending = (_b = state.ending) !== null && _b !== void 0 ? _b : 'timeup';
        const title = (0, Reducers_1.titleByShame)(state.stats.shame);
        const profile = this.shared.getProfile();
        if (state.stats.score > profile.bestScore) {
            this.shared.saveProfile({ bestScore: state.stats.score, bestTitle: title });
        }
    }
    onExit() { }
    update(_dt) { }
    render(ctx) {
        const w = this.shared.width;
        const h = this.shared.height;
        const state = this.shared.getState();
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#1b1f2a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.fillText(Config_1.GAME_CONFIG.title, 20, 40);
        ctx.font = '20px sans-serif';
        ctx.fillText('本局总结海报', 20, 70);
        ctx.font = '16px sans-serif';
        ctx.fillText((0, Reducers_1.endingText)(this.ending), 20, 98);
        ctx.fillText(`积分: ${state.stats.score.toFixed(0)}`, 20, 124);
        ctx.fillText(`羞耻值: ${state.stats.shame.toFixed(0)}`, 20, 148);
        const title = (0, Reducers_1.titleByShame)(state.stats.shame);
        ctx.fillText(`称号: ${title}`, 20, 174);
        if (state.stats.alc <= 20 && state.stats.shame <= 20) {
            ctx.fillStyle = '#8fe388';
            ctx.fillText('你没有逃避', 20, 198);
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillText('行为统计', 20, 228);
        ctx.fillText(`喝酒: ${state.counters.drink}`, 20, 252);
        ctx.fillText(`外放视频: ${state.counters.phone}`, 20, 276);
        ctx.fillText(`骚扰电话: ${state.counters.harass}`, 20, 300);
        ctx.fillText(`发朋友圈: ${state.counters.post}`, 20, 324);
        ctx.fillText(`拒酒成功/失败: ${state.counters.qteWin}/${state.counters.qteLose}`, 20, 348);
        const profile = this.shared.getProfile();
        ctx.fillText(`历史最高分: ${profile.bestScore.toFixed(0)} (${profile.bestTitle})`, 20, 386);
        this.restartBtn.render(ctx);
    }
    onTap(x, y) {
        if (this.restartBtn.contains(x, y)) {
            this.shared.restart();
        }
    }
}
exports.ResultScene = ResultScene;
