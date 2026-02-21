export class AssetLoader {
  private images: Record<string, any> = {};
  private ready: Record<string, boolean> = {};

  register(key: string, src: string): void {
    if (this.images[key]) return;
    const img = wx.createImage();
    this.images[key] = img;
    this.ready[key] = false;
    img.onload = () => {
      this.ready[key] = true;
    };
    img.onerror = () => {
      this.ready[key] = false;
    };
    img.src = src;
  }

  get(key: string): any | null {
    if (!this.images[key]) return null;
    return this.images[key];
  }

  isReady(key: string): boolean {
    return Boolean(this.ready[key]);
  }
}
