export type StatKey = 'mood' | 'alc' | 'tol' | 'score' | 'shame';

export type EndingType =
  | 'home'
  | 'street'
  | 'kicked'
  | 'poisoned'
  | 'timeup';

export interface Stats {
  mood: number;
  alc: number;
  tol: number;
  score: number;
  shame: number;
}

export interface Unlocks {
  npcDialog: boolean;
  phone: boolean;
  harass: boolean;
  post: boolean;
}

export interface Cooldowns {
  pretend: number;
}

export interface DrunkFlags {
  boostColor: boolean;
  shake: boolean;
  delayInput: boolean;
  invertControl: boolean;
  flyButtons: boolean;
}

export interface Counters {
  drink: number;
  phone: number;
  harass: number;
  post: number;
  dialogWrong: number;
  qteWin: number;
  qteLose: number;
}

export interface GameState {
  timeLeft: number;
  stats: Stats;
  unlocks: Unlocks;
  cooldowns: Cooldowns;
  drunkFlags: DrunkFlags;
  ending: EndingType | null;
  lastCrazyActionAt: number;
  now: number;
  actionLog: string[];
  counters: Counters;
  qteNextAt: number;
}

export interface ActionResult {
  deltaStats: Partial<Stats>;
  messages: string[];
  sfx?: string;
}

export interface PlayerProfile {
  bestScore: number;
  bestTitle: string;
}
