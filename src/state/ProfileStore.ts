import { PlayerProfile } from './GameState';

const STORAGE_KEY = 'drunk_mvp_profile';

export function loadProfile(): PlayerProfile {
  try {
    const data = wx.getStorageSync(STORAGE_KEY);
    if (data && typeof data.bestScore === 'number' && typeof data.bestTitle === 'string') {
      return data as PlayerProfile;
    }
  } catch (_) {
    // ignore read errors
  }
  return { bestScore: 0, bestTitle: '暂无' };
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    wx.setStorageSync(STORAGE_KEY, profile);
  } catch (_) {
    // ignore write errors
  }
}
