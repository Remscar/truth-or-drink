import { getLogger, Maybe, Round } from "../../util";
import { randomElementFromArray } from "../../util/helpers";

import * as fs from 'fs';
import * as path from 'path';

const logger = getLogger(`TruthOrDrinkGame`);



const getNormalDeck = (name: string): string[] => {
  let rawDeck: Maybe<string> = null;
  try {
    rawDeck = fs.readFileSync(path.join(__dirname, 'questions', `${name}.txt`)).toString();
  } catch (e) {
    throw Error(`Cannot load deck ${name}: ${e}`);
  }

  const questions = rawDeck.split(`\n`);
  return questions;
}

export class TruthOrDrinkGame {
  private questions: string[] = [];


  constructor(decks: string[]) {
    for (const deck of decks) {
      const deckQuestions = getNormalDeck(deck);
      this.questions = this.questions.concat(deckQuestions);
      logger.debug(`Imported ${deckQuestions.length} questions from ${deck}`);
    }

    logger.log(`Created new game with ${this.questions.length} questions from ${decks.length} decks.`);
  }

  public nextRound(): Round {
    const q1 = randomElementFromArray(this.questions);
    const q2 = randomElementFromArray(this.questions);
    const round: Round = {
      questions: [q1, q2]
    }
  
    return round;
  }
}
