const ANY_CARD = "ANY";

export enum EventQueryType {
  DRAW_CARD = "draw card",
  // PLUS_COIN = "+ coin",
}

export type EventRecord = {
  type: EventQueryType;
  playerName: string;
  gameNumber: number;
  amount: number;
  fromCard: string;
  toCard?: string | undefined;
};

export class EventQueryManager {
  eventQueries?: EventQuery[] | undefined;
  constructor(eventQueries?: EventQuery[] | undefined) {
    this.eventQueries = eventQueries;
  }

  recordEffect(eventRecord: EventRecord) {
    if (this.eventQueries) {
      for (const query of this.eventQueries) {
        query.recordEffect(eventRecord);
      }
    }
  }
}

export class EventQuery {
  type: EventQueryType;
  fromCard: string | undefined;
  toCard: string | undefined;
  byTurn: number | undefined;
  effectRecords: Map<number, EventRecord[]>;
  constructor(
    type: EventQueryType,
    fromCard?: string,
    byTurn?: number,
    toCard?: string,
  ) {
    this.type = type;
    this.fromCard = fromCard;
    this.byTurn = byTurn;
    this.toCard = toCard;
    this.effectRecords = new Map();
  }

  private appliesToQuery(effectRecord: EventRecord): boolean {
    return (
      effectRecord.type === this.type &&
      (!this.fromCard ||
        this.fromCard === ANY_CARD ||
        effectRecord.fromCard === this.fromCard) &&
      (!this.toCard ||
        this.toCard === ANY_CARD ||
        this.toCard === effectRecord.toCard)
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
}
