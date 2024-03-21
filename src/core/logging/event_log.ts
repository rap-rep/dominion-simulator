import { XOR } from "ts-xor";
import { Decision } from "../decisions";
import { Effect } from "../effects";
import { Card } from "../card";
import { GameLog, LogMode } from "./game_log";

export class EventLogEvent {
  line: string;

  constructor(line: string) {
    this.line = line;
  }
}

export class EventLog {
  events: EventLogEvent[] = [];
  mode: LogMode;
  gamelog: GameLog;

  constructor(gamelog: GameLog, mode: LogMode = LogMode.BUFFER) {
    this.gamelog = gamelog;
    this.mode = mode;
  }

  logEffect(node: XOR<Decision, Effect>) {
    let parenthetical = node.affects;
    if (node.affects instanceof Card) {
      parenthetical = node.affects.name;
    } else if (Array.isArray(node.affects)) {
      const builder: string[] = new Array();
      for (const elem of node.affects) {
        if (elem instanceof Card) builder.push(elem.name);
      }
      parenthetical = builder.join(", ");
    }
    const line = `<Effect: ${node.effectType || ""} (${parenthetical}) via ${node.fromCard.name}>`;
    this.gamelog.log(line);

    const logEvent = new EventLogEvent(line);
    if (this.mode === LogMode.CONSOLE_LOG) {
      console.log(logEvent.line);
    } else if (this.mode === LogMode.BUFFER) {
      this.events.push(logEvent);
    }
  }

  logDecision(node: XOR<Decision, Effect>) {
    let parenthetical = node.result;
    if (node.result instanceof Card) {
      parenthetical = node.result.name;
    } else if (Array.isArray(node.result)) {
      const builder: string[] = new Array();
      for (const elem of node.result) {
        if (elem instanceof Card) {
          builder.push(elem.name);
        }
      }
      parenthetical = builder.join(", ");
    }
    const line = `<Decision: ${node.decisionType || ""} ${parenthetical} via ${node.fromCard.name}>`;
    this.gamelog.log(line);
    const logEvent = new EventLogEvent(line);
    if (this.mode === LogMode.CONSOLE_LOG) {
      console.log(logEvent.line);
    } else if (this.mode === LogMode.BUFFER) {
      this.events.push(logEvent);
    }
  }
}
