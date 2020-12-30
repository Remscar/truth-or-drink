"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoundData = exports.NormalQuestions = void 0;
const helpers_1 = require("../../util/helpers");
exports.NormalQuestions = [
    "How many dogs have you eaten in your life?",
    "Do you like big butts and can you lie?",
    "Do you find any issue with the fact that this is a question?",
    "Could there possibly be too much facts in the ocean?",
];
exports.getRoundData = () => {
    const q1 = helpers_1.randomElementFromArray(exports.NormalQuestions);
    const q2 = helpers_1.randomElementFromArray(exports.NormalQuestions);
    const round = {
        questions: [q1, q2]
    };
    return round;
};
