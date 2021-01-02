import { getLogger, Maybe, Round } from "../../util";
import { randomElementFromArray, shuffleArray } from "../../util/helpers";

import * as fs from 'fs';
import * as path from 'path';

const logger = getLogger(`TruthOrDrinkGame`);

const getNormalDeck = (name: string): string[] => {
  let rawDeck: Maybe<string> = null;
  try {
    let cwd = process.cwd();
    if (process.env.TS_NODE_DEV) {
      cwd = path.join(cwd, '..');
    }
    rawDeck = fs.readFileSync(path.join(cwd, 'questions', `${name}.txt`)).toString();
  } catch (e) {
    throw Error(`Cannot load deck ${name}: ${e}`);
  }

  const questions = rawDeck.split(`\n`);
  return questions;
}

export class TruthOrDrinkGame {
  private questions: string[] = [];


  constructor(private decks: string[]) {
    this.questions = shuffleArray(this.questions);
    this.loadQuestionsFromDeck();
    logger.log(`Created new game with ${this.questions.length} questions from ${decks.length} decks.`);
  }

  private loadQuestionsFromDeck() {
    for (const deck of this.decks) {
      const deckQuestions = getNormalDeck(deck);
      this.questions = this.questions.concat(deckQuestions);
      logger.debug(`Imported ${deckQuestions.length} questions from ${deck}`);
    }
  }

  private chooseQuestion(): string {
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    const chosenQuestion = this.questions[randomIndex];
    this.questions.splice(randomIndex, 1);

    return chosenQuestion;
  }

  public nextRound(): Round {
    if (this.questions.length < 5) {
      this.loadQuestionsFromDeck();
    }
    
    const q1 = this.chooseQuestion();
    const q2 = this.chooseQuestion();
    const round: Round = {
      questions: [q1, q2]
    }
  
    return round;
  }
}
