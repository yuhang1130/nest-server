import { Logger as nestLogger } from "@nestjs/common";
import * as util from "util";
import * as dayjs from "dayjs";
import * as chalk from "chalk";
import { isLocal, isProd, logLevel } from "../config";

const levels: string[] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

export enum Level {
  DEBUG = levels.indexOf("DEBUG"),
  INFO = levels.indexOf("INFO"),
  WARN = levels.indexOf("WARN"),
  ERROR = levels.indexOf("ERROR"),
  FATAL = levels.indexOf("FATAL"),
}

let threshold: Level = Level.INFO;

export class Logger {
  private readonly name: string;
  private readonly timeMap: Map<string, number>;

  constructor(name: string) {
    this.name = name;
    this.timeMap = new Map();
  }

  public isDebug(): boolean {
    return threshold <= Level.DEBUG;
  }

  public isInfo(): boolean {
    return threshold <= Level.INFO;
  }

  public isWarn(): boolean {
    return threshold <= Level.WARN;
  }

  // 默认日志等级是info，如果需要输出debug内容
  // 需要设置环境变量 LOG_LEVEL=debug
  public debug(fmt: string, ...args: any) {
    if (this.isDebug()) {
      return this.print(this.format("DEBUG", fmt, ...args));
    }
  }

  public info(fmt: string, ...args: any) {
    if (this.isInfo()) {
      return this.print(this.format("INFO", fmt, ...args));
    }
  }

  public warn(fmt: string, ...args: any) {
    if (this.isWarn()) {
      return this.print(this.format("WARN", fmt, ...args));
    }
  }

  public error(fmt: string, ...args: any) {
    this.print(this.format("ERROR", fmt, ...args));
  }

  public errorWithTrace(fmt: string, ...args: any) {
    this.print(this.format("ERROR", fmt, ...args));
    console.trace();
  }

  public time(name: string) {
    this.timeMap.set(name, Date.now());
  }

  public timeEnd(name: string, logSeconds = 0) {
    const startTime = this.timeMap.get(name);
    if (!startTime) {
      return;
    }
    this.timeMap.delete(name);

    const costTime = (Date.now() - startTime) / 1e3;

    if (costTime > logSeconds) {
      this.warn("%s cost %s seconds", name, costTime.toFixed(1));
    }
  }

  private format(level: string, fmt: string, ...args: any): string {
    const text = args ? util.format(fmt, ...args) : fmt;
    return (
      this.pidName() +
      " " +
      this.timestamp() +
      " " +
      this.text(level, `${this.level(level)} ${this.modName()} ${text}`)
    );
  }

  private pidName(): string {
    return Fmt.bracket(String(process.pid));
  }

  private modName(): string {
    return Fmt.bracket(this.name);
  }

  private timestamp(): string {
    return Fmt.timestamp();
  }

  private level(level: string): string {
    switch (level) {
    case "DEBUG":
      return Fmt.bracket("D");
    case "INFO":
      return Fmt.bracket("I");
    case "WARN":
      return Fmt.bracket("W");
    case "ERROR":
      return Fmt.bracket("E");
    default:
      return Fmt.bracket("UNKNOWN");
    }
  }

  private text(level: string, text: string): string {
    switch (level) {
    case "ERROR":
      return Fmt.red(text);
    case "DEBUG":
      return Fmt.green(text);
    case "INFO":
      return Fmt.blue(text);
    case "WARN":
      return Fmt.magenta(text);
    default:
      return text;
    }
  }

  public fmt(fmt: string, ...args: any): string {
    return util.format(fmt, ...args);
  }

  private print(text: string) {
    process.stdout.write(text);
    process.stdout.write("\n");
  }

  public static SetLogLevel(setting: string) {
    const uppercase = String(setting).toUpperCase();

    if (levels.includes(uppercase)) {
      threshold = levels.indexOf(uppercase);
      return;
    }

    nestLogger.error(`Unsupported log level: ${setting}`);
  }
}

export const SetLogLevel = Logger.SetLogLevel;

function initLogLevel() {
  const level = logLevel || (isProd ? "info" : "debug");
  if (level) {
    SetLogLevel(level);
  }
}

initLogLevel();

class Fmt {
  private static instance: Fmt;
  private static _timestamp: string;
  private static _disableColor: boolean =
    Boolean(process.env.NO_COLOR) || !isLocal;

  private constructor() {
    Fmt.updateTimestamp();
    setInterval(Fmt.updateTimestamp, 1e3);
  }

  public static getInstance() {
    if (!Fmt.instance) {
      Fmt.instance = new Fmt();
    }
    return Fmt.instance;
  }

  static updateTimestamp() {
    Fmt._timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss.sss").padEnd(24, " ");
  }

  static timestamp(): string {
    return this._timestamp;
  }

  static bracket(text: string): string {
    return "[" + text + "]";
  }

  static green(text: string): string {
    return Fmt._disableColor ? text : chalk.cyanBright(text);
  }

  static blue(text: string): string {
    return Fmt._disableColor ? text : chalk.blueBright(text);
  }

  static magenta(text: string): string {
    return Fmt._disableColor ? text : chalk.yellowBright(text);
  }

  static red(text: string): string {
    return Fmt._disableColor ? text : chalk.redBright(text);
  }

  static yellow(text: string): string {
    return Fmt._disableColor ? text : chalk.yellow(text);
  }
}
export const Formatter = Fmt.getInstance();
