import { Card, NULL_CARD_NAME } from "../card";
import { Player } from "../player";

export type LogLine = {
  line: string;
  indentation: number;
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
  indentation: number;

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

    this.indentation = 0;
  }

  getBufferedLog(): string[] {
    return this.loglines.map((l) => l.line);
  }

  getBufferedLogHTML(): string[] {
    return this.loglines.map((line) => this.getLineHTML(line));
  }

  log(line: string, level: LogLevel = LogLevel.INFO) {
    if (
      level === LogLevel.INFO ||
      (level === LogLevel.DEBUG && this.level === LogLevel.DEBUG) ||
      this.level === LogLevel.EXTREME
    ) {
      if (this.mode === LogMode.CONSOLE_LOG) {
        console.log(this.getIndentedLine(line, this.indentation));
      } else if (this.mode === LogMode.BUFFER) {
        this.loglines.push({ line: line, indentation: this.indentation});
      }
    }
  }

  indent(){
    this.indentation += 1;
  }

  dedent(){
    if (this.indentation === 0){
      throw new Error("Trying to dedent log below zero! Logging must be broken, panicking...")
    }
    this.indentation -= 1;
  }

  private getIndentedLine(line: string, indentation: number): string {
    return ' '.repeat(indentation * 2) + line;
  }

  private getLineHTML(line: LogLine): string {
    return '&emsp;'.repeat(line.indentation) + line.line;
  }

  logTurn(turn: number, playerName: string) {
    this.log("");
    this.log(`---- Turn ${turn} - ${playerName} ----`);
  }

  logCardPlay(card: Card, playerName: string) {
    this.log(`${playerName} plays ${card.name}`);
  }

  logBuy(player: Player, card: string) {
    if (card === NULL_CARD_NAME) {
      this.log(`${player.name} passes on remaining buy(s)`);
    } else {
      this.log(`${player.name} buys ${card}`);
    }
  }

  logGain(player: Player, card: Card) {
    this.log(`${player.name} gains ${card.name}`);
  }

  logDraw(player: Player, card: Card) {
    this.log(`${player.name} draws ${card.name}`);
  }

  logShuffle(player: Player) {
    this.log(
      `${player.name} shuffles their deck (${player.discard.length} of ${player.allCardsList.length})`,
    );
  }

  logDuration(player: Player, card: Card) {
    this.log(`${player.name} receives duration effect from ${card.name}`);
  }

  logTopdeck(player: Player, card: Card) {
    this.log(`${player.name} topdecks ${card.name}`);
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

  logExile(player: Player, card: Card) {
    this.log(`${player.name} exiles ${card.name}`);
  }

  logExileDiscard(player: Player, card: Card, amount: number) {
    this.log(`${player.name} discards ${amount} ${card.name} from exile`);
  }

  logReturnCard(player: Player, card: Card) {
    this.log(`${player.name} returns ${card.name}`);
  }

  logFailReturnCard(player: Player, card: Card) {
    this.log(`${player.name} failed to return ${card.name}`);
  }
}
