import { CardNameMap } from "./cards/name_map";
import { GameLog, LogLevel, LogMode } from "./logging/game_log";
import { Kingdom } from "./kingdom";
import { Player } from "./player";
import { EventLog } from "./logging/event_log";
import { PlayerHelper } from "./helpers/player_helper";

export type GameConfig = {
  logMode?: LogMode | undefined;
  logLevel?: LogLevel | undefined;
};

export class Game {
  /*
   * Where the core game of Dominion is played
   * Cards are unsleeved and shuffled recklessly
   */
  kingdom: Kingdom;
  p1: Player;
  p2: Player;
  currentPlayer: Player;
  turn: number = 0;
  gamelog: GameLog;
  eventlog: EventLog;
  phase: Phase = Phase.START;
  cardNameMap: CardNameMap;
  winner: undefined | Player | null;

  constructor(config?: GameConfig | undefined) {
    this.cardNameMap = new CardNameMap();
    this.kingdom = new Kingdom();
    this.gamelog = new GameLog(config?.logMode, config?.logLevel);
    this.eventlog = new EventLog(this.gamelog);
    this.p1 = new Player("player one", this);
    this.p2 = new Player("player two", this);
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    this.currentPlayer = this.p1;
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
    this.logGameOver(this.p1);
    this.logGameOver(this.p2);
    this.assignWinner();
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
    this.gamelog.logTurn(this.turn, this.currentPlayer.name);
  }

  private logGameOver(player: Player) {
    this.gamelog.log(`${player.name} ending game cards: `);
    for (const card of player.allCardsMap.keys()) {
      this.gamelog.log(`${player.allCardsMap.get(card)?.length} x ${card}`);
    }
    this.gamelog.log(`Score: ${PlayerHelper.countVictoryPoints(player)}`);
  }


  private assignWinner() {
    const p1Points = PlayerHelper.countVictoryPoints(this.p1);
    const p2Points = PlayerHelper.countVictoryPoints(this.p2);
    if (p1Points === p2Points){
      this.winner = null;
    }
    else if (p1Points > p2Points){
      this.winner = this.p1;
    }
    else{
      this.winner = this.p2;
    }
    this.gamelog.log(`Winner: ${this.winner?.name || "Tie"}`);
  }
}

export enum Phase {
  START = "Start",
  ACTION = "Action",
  TREASURE = "Treasure",
  BUY = "Buy",
  CLEAN_UP = "Clean up",
}
