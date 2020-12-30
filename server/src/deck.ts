import { randomElementFromArray } from "../util/helpers";

export const NormalQuestions = [
  "Test1",
  "Test2",
  "Test3",
  "Test4",
]

export interface Round {
  questions: [string, string];
}

export const getCard = () => {
  const q1 = randomElementFromArray(NormalQuestions);
  const q2 = randomElementFromArray(NormalQuestions);
  const round: Round = {
    questions: [q1, q2]
  }
  
  return round;
}