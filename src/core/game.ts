import { CardNameMap } from "./cards/name_map";
import { GameLog } from "./gamelog/game_log";
import { Kingdom } from "./kingdom";
import { Player } from "./player";

export class Game {
  /*
   * Where the core game of Dominion is played
   */
  kingdom: Kingdom;
  p1: Player;
  p2: Player;
  currentPlayer: Player;
  turn: number = 0;
  gamelog: GameLog;
  phase: Phase = Phase.START;
  cardNameMap: CardNameMap;

  constructor() {
    this.cardNameMap = new CardNameMap();
    this.kingdom = new Kingdom();
    this.p1 = new Player("player one", this);
    this.p2 = new Player("player two", this);
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    this.currentPlayer = this.p1;
    this.gamelog = new GameLog();
  }

  playGame() {
    while (!this.kingdom.gameOver() && this.turn < 500) {
      this.incrementTurn();
      this.currentPlayer.startTurn();
      this.currentPlayer.playActionPhase();
      this.currentPlayer.playTreasurePhase();
      this.currentPlayer.playBuyPhase();
      this.currentPlayer.playCleanupPhase();
      this.switchPlayer();
    }
  }

  private switchPlayer() {
    if (this.currentPlayer == this.p1) {
      this.currentPlayer = this.p2;
    } else {
      this.currentPlayer = this.p1;
    }
  }

  private incrementTurn() {
    if (this.currentPlayer == this.p1) {
      this.turn++;
    }
  }
}

export enum Phase {
  START = "Start",
  ACTION = "Action",
  TREASURE = "Treasure",
  BUY = "Buy",
  CLEAN_UP = "Clean up",
}
