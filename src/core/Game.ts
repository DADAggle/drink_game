import { AudioSystem } from '../systems/AudioSystem';
import { SceneManager } from './SceneManager';
import { SceneName } from './Scene';
import { Ticker } from './Ticker';
import { Input } from './Input';
import { createInitialState } from '../state/Config';
import { GameState, PlayerProfile } from '../state/GameState';
import { PartyScene } from '../scenes/PartyScene';
import { BalanceScene } from '../scenes/BalanceScene';
import { ResultScene } from '../scenes/ResultScene';
import { loadProfile, saveProfile } from '../state/ProfileStore';

export interface SharedContext {
  width: number;
  height: number;
  sceneManager: SceneManager;
  audio: AudioSystem;
  getState: () => GameState;
  setState: (s: GameState) => void;
  restart: () => void;
  getProfile: () => PlayerProfile;
  saveProfile: (p: PlayerProfile) => void;
}

export class Game {
  private readonly canvas: any;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly ticker: Ticker;
  private readonly input: Input;
  private readonly audio: AudioSystem;
  private sceneManager: SceneManager;
  private state: GameState;
  private profile: PlayerProfile;
  private shared!: SharedContext;

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

    this.audio = new AudioSystem();
    this.state = createInitialState();
    this.profile = loadProfile();

    this.shared = {
      width: this.canvas.width,
      height: this.canvas.height,
      sceneManager: null as unknown as SceneManager,
      audio: this.audio,
      getState: () => this.state,
      setState: (s) => {
        this.state = s;
      },
      restart: () => {
        this.state = createInitialState();
        this.sceneManager.switch('party');
      },
      getProfile: () => this.profile,
      saveProfile: (p) => {
        this.profile = p;
        saveProfile(p);
      },
    };
    this.sceneManager = new SceneManager((name) => this.createScene(name), 'party');
    this.shared.sceneManager = this.sceneManager;

    this.ticker = new Ticker((dt) => this.tick(dt));
    this.input = new Input();
    this.input.onTap((e) => this.sceneManager.onTap(e.x, e.y));
    this.input.onMove((e) => this.sceneManager.onTouchMove(e.x, e.y));
    this.input.onEnd((e) => this.sceneManager.onTouchEnd(e.x, e.y));
  }

  start(): void {
    this.audio.startBgm();
    this.input.start();
    this.ticker.start();
  }

  private tick(dt: number): void {
    this.sceneManager.update(dt);
    this.sceneManager.render(this.ctx);
  }

  private createScene(name: SceneName) {
    if (name === 'party') {
      return new PartyScene(this.shared);
    }
    if (name === 'balance') {
      return new BalanceScene(this.shared);
    }
    return new ResultScene(this.shared);
  }
}
