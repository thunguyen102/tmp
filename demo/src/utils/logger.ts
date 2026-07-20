export class Logger {
  private className: string;
  private logLevel: string;

  constructor(className: string, logLevel: string = 'info') {
    this.className = className;
    this.logLevel = logLevel.toLowerCase();
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.className}] ${message}`;
  }

  info(message: string): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      console.log(this.formatMessage('info', message));
    }
  }

  debug(message: string): void {
    if (this.logLevel === 'debug') {
      console.log(this.formatMessage('debug', message));
    }
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string, error?: Error): void {
    console.error(this.formatMessage('error', message));
    if (error) {
      console.error(error.stack);
    }
  }
}
