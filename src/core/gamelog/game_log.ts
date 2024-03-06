export class LogLine {
  line: string;
  indentation: number;

  constructor(line: string, indentation: number = 0) {
    this.line = line;
    this.indentation = indentation;
  }
}

export enum LogMode {
  CONSOLE_LOG = "console_log",
  BUFFER = "buffer",
}

export class GameLog {
  loglines: LogLine[] = [];
  mode: LogMode;

  constructor(mode: LogMode = LogMode.CONSOLE_LOG) {
    this.mode = mode;
  }

  log(line: string) {
    if (this.mode === LogMode.CONSOLE_LOG) {
      console.log(line);
    }
  }
}
