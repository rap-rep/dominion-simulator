import { CardNameMap } from "./cards/name_map";
import { GameLog, LogLevel, LogMode } from "./logging/game_log";
import { Kingdom } from "./kingdom";
import { Player } from "./player";
import { ResolverLog } from "./logging/resolver_log";
import { PlayerHelper } from "./helpers/player_helper";
import { ConditionSetList } from "./logic/ordered_condition_gaining";
import { EventQueryInput, EventQueryManager } from "./logging/event_query";

const MAX_TURNS = 100;

export type GameConfig = {
  logMode?: LogMode | undefined;
  logLevel?: LogLevel | undefined;
  p1gainRules?: ConditionSetList | undefined;
  p2gainRules?: ConditionSetList | undefined;
  gameNumber?: number | undefined;
  eventQueryManager?: EventQueryManager | undefined;
  p1Name?: string | undefined;
  p2Name?: string | undefined;
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
  eventlog: ResolverLog;
  phase: Phase = Phase.START;
  cardNameMap: CardNameMap;
  winner: undefined | Player | null;
  gameNumber: number;
  eventQueryManager: EventQueryManager;

  constructor(config?: GameConfig | undefined) {
    this.cardNameMap = new CardNameMap();
    this.kingdom = new Kingdom();
    this.gamelog = new GameLog(config?.logMode, config?.logLevel);
    this.eventlog = new ResolverLog(this.gamelog);
    this.gameNumber = config?.gameNumber || 1;
    this.p1 = new Player(
      config?.p1Name || "player one",
      this,
      config?.p1gainRules,
    );
    this.p2 = new Player(
      config?.p2Name || "player two",
      this,
      config?.p2gainRules,
    );
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    this.currentPlayer = this.p1;
    this.eventQueryManager =
      config?.eventQueryManager || new EventQueryManager();
  }

  playGame() {
    while (!this.kingdom.gameOver() && this.turn < MAX_TURNS) {
      this.incrementTurn();
      this.currentPlayer.playStartTurn();
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
    if (this.currentPlayer === this.p1) {
      this.currentPlayer = this.p2;
    } else {
      this.currentPlayer = this.p1;
    }
  }

  private incrementTurn() {
    if (this.currentPlayer === this.p1) {
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
    if (p1Points === p2Points) {
      this.winner = null;
    } else if (p1Points > p2Points) {
      this.winner = this.p1;
    } else {
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
