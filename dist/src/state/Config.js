"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_CONFIG = void 0;
exports.createInitialState = createInitialState;
exports.GAME_CONFIG = {
    title: '今天是酒蒙子吗',
    durationSec: 300,
    moodMin: 0,
    moodMax: 100,
    alcMax: 100,
    tolMin: 0,
    tolMax: 100,
    shameMax: 100,
    unlocks: {
        npcDialog: 15,
        phone: 25,
        harass: 40,
        post: 55,
    },
    qte: {
        interval: 10,
        duration: 2,
        baseTap: 8,
    },
    pretend: {
        cdSec: 3,
        tolGain: 7,
    },
    tolRecovery: {
        recoverPerSec: 0.35,
        freezeAfterCrazySec: 6,
    },
    phoneMiniGame: {
        spamDurationSec: 2,
    },
    drunkChaos: {
        invertThreshold: 72,
        flyThreshold: 68,
        flyAmpBaseX: 12,
        flyAmpBaseY: 10,
        flyAmpScaleX: 0.34,
        flyAmpScaleY: 0.28,
    },
    balance: {
        duration: 12,
        safeRange: 0.62,
        baseDrift: 1.6,
        alcDriftFactor: 0.06,
        controlBase: 0.78,
        controlDecayByAlc: 0.0032,
        controlMin: 0.42,
    },
};
function createInitialState() {
    const mood = 35 + Math.floor(Math.random() * 41);
    return {
        timeLeft: exports.GAME_CONFIG.durationSec,
        stats: {
            mood,
            alc: 0,
            tol: 70,
            score: 0,
            shame: 0,
        },
        unlocks: {
            npcDialog: false,
            phone: false,
            harass: false,
            post: false,
        },
        cooldowns: {
            pretend: 0,
        },
        drunkFlags: {
            boostColor: false,
            shake: false,
            delayInput: false,
            invertControl: false,
            flyButtons: false,
        },
        ending: null,
        lastCrazyActionAt: -999,
        now: 0,
        actionLog: [],
        counters: {
            drink: 0,
            phone: 0,
            harass: 0,
            post: 0,
            dialogWrong: 0,
            qteWin: 0,
            qteLose: 0,
        },
        qteNextAt: 10,
    };
}
