"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const AudioSystem_1 = require("../systems/AudioSystem");
const SceneManager_1 = require("./SceneManager");
const Ticker_1 = require("./Ticker");
const Input_1 = require("./Input");
const Config_1 = require("../state/Config");
const PartyScene_1 = require("../scenes/PartyScene");
const BalanceScene_1 = require("../scenes/BalanceScene");
const ResultScene_1 = require("../scenes/ResultScene");
const ProfileStore_1 = require("../state/ProfileStore");
class Game {
    constructor() {
        this.canvas = wx.createCanvas();
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas 2D context unavailable');
        }
        this.ctx = ctx;
        const info = wx.getSystemInfoSync();
        this.canvas.width = info.windowWidth;
        this.canvas.height = info.windowHeight;
        this.audio = new AudioSystem_1.AudioSystem();
        this.state = (0, Config_1.createInitialState)();
        this.profile = (0, ProfileStore_1.loadProfile)();
        this.shared = {
            width: this.canvas.width,
            height: this.canvas.height,
            sceneManager: null,
            audio: this.audio,
            getState: () => this.state,
            setState: (s) => {
                this.state = s;
            },
            restart: () => {
                this.state = (0, Config_1.createInitialState)();
                this.sceneManager.switch('party');
            },
            getProfile: () => this.profile,
            saveProfile: (p) => {
                this.profile = p;
                (0, ProfileStore_1.saveProfile)(p);
            },
        };
        this.sceneManager = new SceneManager_1.SceneManager((name) => this.createScene(name), 'party');
        this.shared.sceneManager = this.sceneManager;
        this.ticker = new Ticker_1.Ticker((dt) => this.tick(dt));
        this.input = new Input_1.Input();
        this.input.onTap((e) => this.sceneManager.onTap(e.x, e.y));
        this.input.onMove((e) => this.sceneManager.onTouchMove(e.x, e.y));
        this.input.onEnd((e) => this.sceneManager.onTouchEnd(e.x, e.y));
    }
    start() {
        this.audio.startBgm();
        this.input.start();
        this.ticker.start();
    }
    tick(dt) {
        this.sceneManager.update(dt);
        this.sceneManager.render(this.ctx);
    }
    createScene(name) {
        if (name === 'party') {
            return new PartyScene_1.PartyScene(this.shared);
        }
        if (name === 'balance') {
            return new BalanceScene_1.BalanceScene(this.shared);
        }
        return new ResultScene_1.ResultScene(this.shared);
    }
}
exports.Game = Game;
