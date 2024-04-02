import { Game, GameConfig } from "./game";
import { EventQueryInput, EventQueryManager } from "./logging/event_query";
import { EventRecordBuilder } from "./logging/event_record_builders";

export class GameManager {
  defaultGameConfig: GameConfig;
  eventQueryManager: EventQueryManager;
  totalSims: number;
  currentGameNumber: number;
  currentGame: Game;
  p1Name: string;
  p2Name: string;

  constructor(
    gameConfig: GameConfig,
    totalSims: number,
    eventQueryInput: EventQueryInput[],
    p1Name: string = "p1",
    p2Name: string = "p2",
  ) {
    this.defaultGameConfig = gameConfig;
    this.eventQueryManager = new EventQueryManager(
      EventQueryManager.fromInput(p1Name, p2Name, eventQueryInput),
    );
    this.defaultGameConfig.eventQueryManager = this.eventQueryManager;
    this.totalSims = totalSims;
    this.currentGameNumber = 1;

    this.p1Name = p1Name;
    this.p2Name = p2Name;
    this.defaultGameConfig.p1Name = p1Name;
    this.defaultGameConfig.p2Name = p2Name;

    this.currentGame = new Game(this.defaultGameConfig);
  }

  playGames() {
    for (let i = 0; i < this.totalSims; i++) {
      this.currentGame.playGame();
      this.writeEndOfGameMetrics();
      this.currentGame = new Game(this.defaultGameConfig);
    }
  }

  private writeEndOfGameMetrics() {
    for (const effectRecord of EventRecordBuilder.winner(
      this.currentGame,
      this.currentGame.winner,
    )) {
      this.eventQueryManager.recordEvent(effectRecord);
    }
  }
}
