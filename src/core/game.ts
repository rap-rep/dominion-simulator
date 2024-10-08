import { CardNameMap } from "./cards/name_map";
import { GameLog, LogLevel, LogMode } from "./logging/game_log";
import { Kingdom } from "./kingdom";
import { Player } from "./player";
import { ResolverLog } from "./logging/resolver_log";
import { PlayerHelper } from "./helpers/player_helper";
import { ConditionSetList } from "./logic/ordered_condition_gaining";
import { EventQueryManager } from "./logging/event_query";
import { GameHelper } from "./helpers/game_helper";

const DEFAULT_MAX_TURNS = 100;

export enum Starter {
  RANDOM = "random",
  P1 = "p1",
  P2 = "p2",
}

export type GameConfig = {
  logMode?: LogMode | undefined;
  logLevel?: LogLevel | undefined;
  p1gainRules?: ConditionSetList | undefined;
  p2gainRules?: ConditionSetList | undefined;
  gameNumber?: number | undefined;
  eventQueryManager?: EventQueryManager | undefined;
  p1Name?: string | undefined;
  p2Name?: string | undefined;
  starter?: Starter | undefined;
  p1cards?: Array<Array<number | string>>;
  p2cards?: Array<Array<number | string>>;
  turnLimit?: number;
};

export class Game {
  /*
   * Where the core game of Dominion, one at a time, is played
   */
  kingdom: Kingdom;
  p1: Player;
  p2: Player;
  currentPlayer: Player;
  turn: number = 1;
  gamelog: GameLog;
  eventlog: ResolverLog;
  phase: Phase = Phase.START;
  cardNameMap: CardNameMap;
  winner: undefined | Player | Player[];
  starter: Player;
  gameNumber: number;
  eventQueryManager: EventQueryManager;
  maxTurns: number;

  constructor(config?: GameConfig | undefined) {
    this.cardNameMap = new CardNameMap();
    this.kingdom = new Kingdom();
    this.gamelog = new GameLog(config?.logMode, config?.logLevel);
    this.gamelog.log("---- Setup ----");
    this.eventlog = new ResolverLog(this.gamelog);
    this.gameNumber = config?.gameNumber || 1;
    this.p1 = new Player(
      config?.p1Name || "player one",
      this,
      config?.p1gainRules,
      config?.p1cards,
    );
    this.p2 = new Player(
      config?.p2Name || "player two",
      this,
      config?.p2gainRules,
      config?.p2cards,
    );
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    this.currentPlayer = this.p1;
    this.starter = this.currentPlayer;
    this.setupStartPlayer(config);
    this.maxTurns = this.getSafeMaxTurns(config?.turnLimit);
    this.eventQueryManager =
      config?.eventQueryManager || new EventQueryManager();
  }

  playGame(untilTurn?: number | undefined) {
    let gameOver = false;
    this.gamelog.logTurn(this.turn, this.currentPlayer.name);
    while (!gameOver && (this.turn - 1) < (untilTurn || this.maxTurns)) {
      this.currentPlayer.logHand();
      this.currentPlayer.playStartTurn();
      this.currentPlayer.playActionPhase();
      this.currentPlayer.playTreasurePhase();
      this.currentPlayer.logPreBuyPhase();
      this.currentPlayer.playBuyPhase();
      this.currentPlayer.playCleanupPhase();
      gameOver = this.kingdom.gameOver();
      if (!gameOver) {
        this.switchPlayer();
        this.incrementTurn();
      }
    }
    this.logGameOver(this.p1);
    this.logGameOver(this.p2);
    this.assignWinner();
  }

  private setupStartPlayer(config: GameConfig | undefined): void {
    if (
      config === undefined ||
      config.starter === undefined ||
      config.starter === Starter.P1
    ) {
      this.currentPlayer = this.p1;
    } else if (config.starter === Starter.P2) {
      this.currentPlayer = this.p2;
    } else if (config.starter === Starter.RANDOM) {
      if (Math.round(Math.random()) === 0) {
        this.currentPlayer = this.p1;
      } else {
        this.currentPlayer = this.p2;
      }
    } else {
      throw new Error(
        `Invalid value '${config.starter}' specified for starter`,
      );
    }
    this.starter = this.currentPlayer;
  }

  private getSafeMaxTurns(configLimit: number | undefined): number {
    if (!configLimit || configLimit < 1 || configLimit > DEFAULT_MAX_TURNS) {
      return DEFAULT_MAX_TURNS;
    }
    return configLimit;
  }

  private switchPlayer(): void {
    if (this.currentPlayer === this.p1) {
      this.currentPlayer = this.p2;
    } else {
      this.currentPlayer = this.p1;
    }
  }

  private incrementTurn(): void {
    if (this.currentPlayer === this.p1) {
      this.turn++;
    }
    this.gamelog.logTurn(this.turn, this.currentPlayer.name);
  }

  private logGameOver(player: Player): void {
    this.gamelog.log("");
    this.gamelog.log(`---- Game Over (${player.name}) ----`);
    this.gamelog.log(`${player.name} ending game cards: `);
    for (const card of player.allCardsMap.keys()) {
      this.gamelog.log(`${player.allCardsMap.get(card)?.length} x ${card}`);
    }
    this.gamelog.log(`Score: ${PlayerHelper.countVictoryPoints(player)}`);
  }

  private assignWinner(): void {
    const p1Points = PlayerHelper.countVictoryPoints(this.p1);
    const p2Points = PlayerHelper.countVictoryPoints(this.p2);
    if (p1Points === p2Points) {
      if (this.currentPlayer === this.starter) {
        this.winner = this.currentPlayer.opponent;
      } else {
        this.winner = [this.p1, this.p2];
      }
    } else if (p1Points > p2Points) {
      this.winner = this.p1;
    } else {
      this.winner = this.p2;
    }
    if (Array.isArray(this.winner)) {
      this.gamelog.log("Winner: Tie");
    } else {
      this.gamelog.log(`Winner: ${this.winner?.name}`);
    }
    GameHelper.recordVPEvents(this);
  }
}

export enum Phase {
  START = "Start",
  ACTION = "Action",
  TREASURE = "Treasure",
  BUY = "Buy",
  CLEAN_UP = "Clean up",
}
