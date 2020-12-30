import { randomElementFromArray } from "../util/helpers";

export const NormalQuestions = [
  "How many dogs have you eaten in your life?",
  "Do you like big butts and can you lie?",
  "Do you find any issue with the fact that this is a question?",
  "Could there possibly be too much facts in the ocean?",
];

export interface Round {
  questions: [string, string];
}

export const getRoundData = () => {
  const q1 = randomElementFromArray(NormalQuestions);
  const q2 = randomElementFromArray(NormalQuestions);
  const round: Round = {
    questions: [q1, q2],
  };

  return round;
};
