const ANY_CARD = "All";

// JSON import type
export type EventQueryInput = {
  type: EventQueryType;
  fromCard?: string | undefined;
  byTurn?: number | undefined;
  toCard?: string | undefined;
  byTurnModifier?: ByTurnModifier | undefined;
};

export enum ByTurnModifier {
  DEFAULT = "by",
  ON_TURN = "on",
}

export type EventQueryResult = {
  type: EventQueryType;
  fromCard: string | undefined;
  byTurn: number;
  toCard: string | undefined;
  average: number;
  playerName: string | undefined;
  byTurnModifier: string | undefined;
};

export enum EventQueryType {
  WINS = "wins",
  DRAW_CARD = "cards drawn",
  VP = "vp",
  TRASH = "trash",
  PLUS_COINS = "coins",
}

export type EventRecord = {
  type: EventQueryType;
  playerName: string;
  gameNumber: number;
  amount: number;
  turn: number;
  fromCard?: string | undefined;
  toCard?: string | undefined;
};

export class EventQueryManager {
  eventQueries?: EventQuery[] | undefined;
  constructor(eventQueries?: EventQuery[] | undefined) {
    this.eventQueries = eventQueries;
  }

  static fromInput(
    p1Name: string,
    p2Name: string,
    eventQueryInput: EventQueryInput[] | undefined,
  ): EventQuery[] {
    if (eventQueryInput === undefined) {
      return [];
    }
    const outputQueries = [];
    for (const playerName of [p1Name, p2Name]) {
      for (const inputQuery of eventQueryInput) {
        outputQueries.push(
          new EventQuery(
            inputQuery.type,
            inputQuery.fromCard,
            inputQuery.byTurn,
            inputQuery.toCard,
            playerName,
            inputQuery.byTurnModifier,
          ),
        );
      }
    }
    return outputQueries;
  }

  recordEvent(eventRecord: EventRecord) {
    if (this.eventQueries) {
      for (const query of this.eventQueries) {
        query.recordEffect(eventRecord);
      }
    }
  }

  getJsonResults(numGames: number): EventQueryResult[] {
    const results = new Array();
    if (this.eventQueries) {
      for (const query of this.eventQueries) {
        results.push(query.getJsonResult(numGames));
      }
    }
    return results;
  }
}

export class EventQuery {
  type: EventQueryType;
  fromCard: string | undefined;
  toCard: string | undefined;
  byTurn: number | undefined;
  byTurnModifier: ByTurnModifier | undefined;
  playerName: string | undefined;
  effectRecords: Map<number, EventRecord[]>;
  constructor(
    type: EventQueryType,
    fromCard?: string,
    byTurn?: number,
    toCard?: string,
    playerName?: string,
    byTurnModifier?: ByTurnModifier,
  ) {
    this.type = type;
    this.fromCard = fromCard;
    this.byTurn = byTurn;
    this.byTurnModifier = byTurnModifier;
    this.toCard = toCard;
    this.playerName = playerName;
    this.effectRecords = new Map();
  }

  getJsonResult(numGames: number): EventQueryResult {
    return {
      type: this.type,
      fromCard: this.fromCard,
      toCard: this.toCard,
      byTurn: this.byTurn || 99,
      average: this.getAverage(numGames),
      playerName: this.playerName,
      byTurnModifier: this.byTurnModifier || ByTurnModifier.DEFAULT,
    };
  }

  private appliesToQuery(effectRecord: EventRecord): boolean {
    return (
      effectRecord.type === this.type &&
      (this.playerName === undefined ||
        effectRecord.playerName === this.playerName) &&
      (!this.fromCard ||
        this.fromCard === ANY_CARD ||
        effectRecord.fromCard === this.fromCard) &&
      (!this.toCard ||
        this.toCard === ANY_CARD ||
        this.toCard === effectRecord.toCard) &&
      (this.byTurn === undefined ||
        ((!this.byTurnModifier ||
          this.byTurnModifier === ByTurnModifier.DEFAULT) &&
          effectRecord.turn <= this.byTurn) ||
        (this.byTurnModifier === ByTurnModifier.ON_TURN &&
          effectRecord.turn === this.byTurn))
    );
  }

  recordEffect(effectRecord: EventRecord) {
    if (!this.appliesToQuery(effectRecord)) {
      return;
    }

    let gameEffectRecords = this.effectRecords.get(effectRecord.gameNumber);
    if (!gameEffectRecords) {
      gameEffectRecords = new Array();
      this.effectRecords.set(effectRecord.gameNumber, gameEffectRecords);
    }
    gameEffectRecords.push(effectRecord);
  }

  getTotal(): number {
    let total = 0;
    for (const gameRecords of this.effectRecords.values()) {
      for (const gameRecord of gameRecords) {
        total += gameRecord.amount;
      }
    }
    return total;
  }

  getAverage(numGames: number) {
    return this.getTotal() / numGames;
  }
}
