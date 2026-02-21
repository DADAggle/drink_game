export class AudioSystem {
  private bgm: any | null = null;
  private initialized = false;

  startBgm(): void {
    if (this.initialized) return;
    this.initialized = true;
    try {
      this.bgm = wx.createInnerAudioContext();
      this.bgm.loop = true;
      this.bgm.autoplay = false;
      this.bgm.src = 'assets/bgm.mp3';
      this.bgm.volume = 0.3;
      this.bgm.play();
    } catch (_) {
      // simulator without audio file
    }
  }

  setDrunkLevel(level: number): void {
    if (!this.bgm) return;
    this.bgm.volume = Math.max(0.2, Math.min(0.8, 0.3 + level * 0.003));
  }

  sfx(_name: string): void {
    // Placeholder for MVP: one-shot effects can be attached later.
  }
}
