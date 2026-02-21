"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProfile = loadProfile;
exports.saveProfile = saveProfile;
const STORAGE_KEY = 'drunk_mvp_profile';
function loadProfile() {
    try {
        const data = wx.getStorageSync(STORAGE_KEY);
        if (data && typeof data.bestScore === 'number' && typeof data.bestTitle === 'string') {
            return data;
        }
    }
    catch (_) {
        // ignore read errors
    }
    return { bestScore: 0, bestTitle: '暂无' };
}
function saveProfile(profile) {
    try {
        wx.setStorageSync(STORAGE_KEY, profile);
    }
    catch (_) {
        // ignore write errors
    }
}
