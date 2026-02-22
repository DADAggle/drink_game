"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCallBomb = generateCallBomb;
exports.generateMoments = generateMoments;
const CALL_OPENERS = [
    '喂你先别挂',
    '你好这里是派对办事处',
    '我有一个严肃通知',
    '你现在方便听我讲道理吗',
    '我刚刚顿悟了',
    '你好我是昨晚的我',
    '请听我最后一句',
    '我现在非常清醒地乱说',
];
const CALL_MIDDLES = [
    '我能把啤酒盖拧成爱心',
    '月亮刚刚给我点赞了',
    '我决定明天开始健身然后现在再喝一杯',
    '电梯今天叫我老师',
    '我和路灯达成战略合作',
    '我的影子申请单飞了',
    '我在地铁里主持了脱口秀',
    '我刚给空气发了年终总结',
    '我已经和零食签了停战协议',
    '我把拖鞋穿出了高定感',
];
const CALL_ENDINGS = [
    '你记得替我保密。',
    '先这样我去拯救世界。',
    '我说完了你别笑。',
    '你要支持我的伟大计划。',
    '我马上再给你补充十条。',
    '请把这段写进族谱。',
    '谢谢你听我播报。',
    '晚安以及早安。',
];
const MOMENT_TEXTS = [
    '今晚和风扇对视三分钟，它先躲开了。',
    '今天的我：表面礼貌，内心蹦迪。',
    '刚刚宣布减肥，庆祝一下先吃两串。',
    '如果快乐有声音，大概是我点开外卖的提示音。',
    '做人最重要的是稳定，我先摇一摇再说。',
    '今晚的发言主题：我都懂但我先不听。',
    '把尴尬折叠一下，明天还能继续用。',
    '人生建议：先深呼吸，再胡说八道。',
    '别人熬夜修仙，我熬夜修理情绪。',
    '我不是困，我是在低功耗运行。',
];
const MOOD_TAGS = ['微醺发言', '社交过载', '灵感失控', '半夜文学', '情绪直播'];
function xorshift(seed) {
    let s = (seed | 0) || 1;
    return () => {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return ((s >>> 0) % 100000) / 100000;
    };
}
function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
}
function generateCallBomb(harassCount, seed) {
    const rand = xorshift(seed + harassCount * 19);
    const base = 4 + Math.min(4, Math.floor(harassCount / 2));
    const count = base + Math.floor(rand() * 2);
    const lines = [];
    for (let i = 0; i < count; i += 1) {
        lines.push(`${pick(rand, CALL_OPENERS)}，${pick(rand, CALL_MIDDLES)}，${pick(rand, CALL_ENDINGS)}`);
    }
    return lines;
}
function generateMoments(postCount, seed) {
    const rand = xorshift(seed + postCount * 37);
    const base = 2 + Math.min(2, Math.floor(postCount / 2));
    const count = base + Math.floor(rand() * 2);
    const items = [];
    for (let i = 0; i < count; i += 1) {
        items.push({
            text: pick(rand, MOMENT_TEXTS),
            likes: 6 + Math.floor(rand() * 88),
            comments: 1 + Math.floor(rand() * 26),
            moodTag: pick(rand, MOOD_TAGS),
        });
    }
    return items;
}
