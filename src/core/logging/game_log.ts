import { Card } from "../card";
import { NullCard } from "../cards/basic/null_card";
import { Player } from "../player";

export type LogLine = {
  line: string;
};

export enum LogMode {
  CONSOLE_LOG = "console_log",
  BUFFER = "buffer",
  SILENT = "silent",
}

export enum LogLevel {
  INFO = "Info",
  DEBUG = "Debug",
  EXTREME = "Extreme",
}

export class GameLog {
  loglines: LogLine[] = [];
  mode: LogMode;
  level: LogLevel;

  constructor(mode?: LogMode | undefined, level?: LogLevel | undefined) {
    if (!mode) {
      this.mode = LogMode.SILENT;
    } else {
      this.mode = mode;
    }
    if (!level) {
      this.level = LogLevel.INFO;
    } else {
      this.level = level;
    }
  }

  getBufferedLog(): string[] {
    return this.loglines.map((l) => l.line);
  }

  log(line: string, level: LogLevel = LogLevel.INFO) {
    if (
      level === LogLevel.INFO ||
      (level === LogLevel.DEBUG && this.level === LogLevel.DEBUG) ||
      this.level === LogLevel.EXTREME
    ) {
      if (this.mode === LogMode.CONSOLE_LOG) {
        console.log(line);
      } else if (this.mode === LogMode.BUFFER) {
        this.loglines.push({ line: line });
      }
    }
  }

  logTurn(turn: number, playerName: string) {
    this.log("");
    this.log(`---- Turn ${turn} - ${playerName} ----`);
  }

  logCardPlay(card: Card, playerName: string) {
    this.log(`${playerName} plays a ${card.name}`);
  }

  logBuy(player: Player, card: string) {
    if (card === NullCard.NAME) {
      this.log(`${player.name} buys nothing`);
    } else {
      this.log(`${player.name} buys a ${card}`);
    }
  }

  logGain(player: Player, card: Card) {
    this.log(`${player.name} gains a ${card.name}`);
  }

  logDraw(player: Player, card: Card) {
    this.log(`${player.name} draws a ${card.name}`);
  }

  logShuffle(player: Player) {
    this.log(
      `${player.name} shuffles their deck (${player.discard.length} of ${player.allCardsList.length})`,
    );
  }

  logDuration(player: Player, card: Card) {
    this.log(`${player.name} receives duration effect from ${card.name}`);
  }

  logDiscardFromPlayCleanup(player: Player, card: Card) {
    if (this.level === LogLevel.DEBUG) {
      this.log(`${player.name} discards ${card.name} from play`);
    }
  }

  logDiscardFromHandCleanup(player: Player, card: Card) {
    if (this.level === LogLevel.DEBUG) {
      this.log(`${player.name} discards ${card.name} from hand`);
    }
  }
}
