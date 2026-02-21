import { GAME_CONFIG } from './Config';
import { ActionResult, EndingType, GameState, Stats } from './GameState';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function pushLog(state: GameState, msg: string): void {
  state.actionLog.push(msg);
  if (state.actionLog.length > 8) {
    state.actionLog.shift();
  }
}

function applyDelta(state: GameState, delta: Partial<Stats>): void {
  state.stats.mood = clamp(state.stats.mood + (delta.mood ?? 0), GAME_CONFIG.moodMin, GAME_CONFIG.moodMax);
  state.stats.alc = clamp(state.stats.alc + (delta.alc ?? 0), 0, GAME_CONFIG.alcMax);
  state.stats.tol = clamp(state.stats.tol + (delta.tol ?? 0), GAME_CONFIG.tolMin, GAME_CONFIG.tolMax);
  state.stats.score = Math.max(0, state.stats.score + (delta.score ?? 0));
  state.stats.shame = clamp(state.stats.shame + (delta.shame ?? 0), 0, GAME_CONFIG.shameMax);
}

export function updateUnlocks(state: GameState): void {
  const alc = state.stats.alc;
  state.unlocks.npcDialog = alc >= GAME_CONFIG.unlocks.npcDialog;
  state.unlocks.phone = alc >= GAME_CONFIG.unlocks.phone;
  state.unlocks.harass = alc >= GAME_CONFIG.unlocks.harass;
  state.unlocks.post = alc >= GAME_CONFIG.unlocks.post;
}

export function updateDrunkFlags(state: GameState): void {
  const alc = state.stats.alc;
  state.drunkFlags.boostColor = alc >= 20;
  state.drunkFlags.shake = alc >= 40;
  state.drunkFlags.delayInput = alc >= 60;
  state.drunkFlags.invertControl = alc >= GAME_CONFIG.drunkChaos.invertThreshold;
  state.drunkFlags.flyButtons = alc >= GAME_CONFIG.drunkChaos.flyThreshold;
}

export function stepState(state: GameState, dt: number): void {
  state.now += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.cooldowns.pretend > 0) {
    state.cooldowns.pretend = Math.max(0, state.cooldowns.pretend - dt);
  }

  const moodDecay = 0.6 + state.stats.alc * 0.02;
  state.stats.mood = clamp(state.stats.mood - moodDecay * dt, GAME_CONFIG.moodMin, GAME_CONFIG.moodMax);

  if (state.now - state.lastCrazyActionAt >= GAME_CONFIG.tolRecovery.freezeAfterCrazySec) {
    state.stats.tol = clamp(
      state.stats.tol + GAME_CONFIG.tolRecovery.recoverPerSec * dt,
      GAME_CONFIG.tolMin,
      GAME_CONFIG.tolMax
    );
  }

  updateUnlocks(state);
  updateDrunkFlags(state);
}

export function checkEnding(state: GameState): EndingType | null {
  if (state.stats.alc >= 100) {
    return 'poisoned';
  }
  if (state.stats.tol <= 0) {
    return 'kicked';
  }
  if (state.timeLeft <= 0) {
    return 'timeup';
  }
  return null;
}

export function actDrink(state: GameState): ActionResult {
  const drinkGain = 6 + (100 - state.stats.mood) * 0.06;
  const delta = { alc: drinkGain, mood: 4, score: 10 };
  applyDelta(state, delta);
  state.counters.drink += 1;
  pushLog(state, '你喝了一杯，短暂兴奋。');
  return { deltaStats: delta, messages: ['喝酒 +10分'] };
}

function applyCrazyActionBase(state: GameState, baseScore: number): Partial<Stats> {
  state.lastCrazyActionAt = state.now;
  return { alc: -4, mood: 6, score: baseScore, shame: 8, tol: -4 };
}

export function actPhone(state: GameState, volumeLevel: number): ActionResult {
  const base = applyCrazyActionBase(state, 30);
  const extra = {
    score: (base.score ?? 0) + 20 * volumeLevel,
    tol: (base.tol ?? 0) - 3 * volumeLevel,
    mood: (base.mood ?? 0) + volumeLevel,
  };
  applyDelta(state, { ...base, ...extra });
  state.counters.phone += 1;
  pushLog(state, `你外放短视频，音量${volumeLevel}档。`);
  return { deltaStats: { ...base, ...extra }, messages: [`外放完成 +${extra.score}分`] };
}

export function actHarass(state: GameState): ActionResult {
  state.lastCrazyActionAt = state.now;
  const delta = { alc: -4, mood: 6, score: 50, shame: 8, tol: -8 };
  applyDelta(state, delta);
  state.counters.harass += 1;
  pushLog(state, '你打了骚扰电话。');
  return { deltaStats: delta, messages: ['骚扰电话 +50分'] };
}

export function actPost(state: GameState): ActionResult {
  state.lastCrazyActionAt = state.now;
  const delta = { alc: -4, mood: 6, score: 60, shame: 8, tol: -10 };
  applyDelta(state, delta);
  state.counters.post += 1;
  pushLog(state, '你发了尴尬朋友圈。');
  return { deltaStats: delta, messages: ['朋友圈 +60分'] };
}

export function actPretendNormal(state: GameState): ActionResult | null {
  if (state.cooldowns.pretend > 0) {
    return null;
  }
  state.cooldowns.pretend = GAME_CONFIG.pretend.cdSec;
  const delta = { tol: GAME_CONFIG.pretend.tolGain, mood: -6 };
  applyDelta(state, delta);
  pushLog(state, '你努力假装正常。');
  return { deltaStats: delta, messages: ['假装正常'] };
}

export function actHarassSpam(state: GameState, taps: number): ActionResult {
  const base = actHarass(state);
  const bonus = Math.min(50, taps) * 3;
  const delta = { score: bonus, shame: Math.floor(taps / 8) };
  applyDelta(state, delta);
  return {
    deltaStats: { ...base.deltaStats, ...delta },
    messages: [`骚扰信息连发${taps}次，额外+${bonus}分`],
  };
}

export function actPostSpam(state: GameState, taps: number): ActionResult {
  const base = actPost(state);
  const bonus = Math.min(50, taps) * 4;
  const delta = { score: bonus, shame: Math.floor(taps / 7) };
  applyDelta(state, delta);
  return {
    deltaStats: { ...base.deltaStats, ...delta },
    messages: [`朋友圈狂发${taps}次，额外+${bonus}分`],
  };
}

export function onDialogAnswer(state: GameState, isCorrect: boolean): ActionResult {
  if (isCorrect) {
    const delta = { score: 40, mood: 2 };
    applyDelta(state, delta);
    pushLog(state, '你成功接住了话题。');
    return { deltaStats: delta, messages: ['对话成功 +40分'] };
  }
  const delta = { tol: -8, shame: 3 };
  applyDelta(state, delta);
  state.counters.dialogWrong += 1;
  pushLog(state, '你说错话了，气氛变冷。');
  return { deltaStats: delta, messages: ['对话失误，容忍度下降'] };
}

export function titleByShame(shame: number): string {
  if (shame <= 20) return '清醒路人';
  if (shame <= 45) return '轻度社死';
  if (shame <= 75) return '派对灾星';
  return '失控传说';
}

export function endingText(ending: EndingType): string {
  const map: Record<EndingType, string> = {
    home: '你成功回家了。',
    street: '你没稳住，露宿街头。',
    kicked: '社会容忍归零，你被请出门。',
    poisoned: '酒精过量，你倒下了。',
    timeup: '五分钟过去，派对散场。',
  };
  return map[ending];
}
