import { Game, GameConfig } from "./game";
import { EventQuery, EventQueryManager } from "./logging/event_query";

export class GameManager {
  defaultGameConfig: GameConfig;
  eventQueryManager: EventQueryManager;
  totalSims: number;
  currentGameNumber: number;
  currentGame: Game;

  constructor(
    gameConfig: GameConfig,
    eventQueries: EventQuery[],
    totalSims: number,
  ) {
    this.defaultGameConfig = gameConfig;
    this.eventQueryManager = new EventQueryManager(eventQueries);
    this.defaultGameConfig.eventQueryManager = this.eventQueryManager;
    this.totalSims = totalSims;
    this.currentGame = new Game(this.defaultGameConfig);
    this.currentGameNumber = 1;
  }

  playGames() {
    for (let i = 0; i < this.totalSims; i++) {
      this.currentGame.playGame();
      this.currentGame = new Game(this.defaultGameConfig);
    }
  }
}
