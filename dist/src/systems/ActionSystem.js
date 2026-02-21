"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSystem = void 0;
const Reducers_1 = require("../state/Reducers");
class ActionSystem {
    drink(state) {
        const result = (0, Reducers_1.actDrink)(state);
        return result.messages[0];
    }
    phone(state, volume) {
        const result = (0, Reducers_1.actPhone)(state, volume);
        return result.messages[0];
    }
    harass(state) {
        const result = (0, Reducers_1.actHarass)(state);
        return result.messages[0];
    }
    post(state) {
        const result = (0, Reducers_1.actPost)(state);
        return result.messages[0];
    }
    harassSpam(state, taps) {
        const result = (0, Reducers_1.actHarassSpam)(state, taps);
        return result.messages[0];
    }
    postSpam(state, taps) {
        const result = (0, Reducers_1.actPostSpam)(state, taps);
        return result.messages[0];
    }
    pretend(state) {
        const result = (0, Reducers_1.actPretendNormal)(state);
        if (!result)
            return '冷静中...';
        return result.messages[0];
    }
    dialogAnswer(state, isCorrect) {
        const result = (0, Reducers_1.onDialogAnswer)(state, isCorrect);
        return result.messages[0];
    }
}
exports.ActionSystem = ActionSystem;
