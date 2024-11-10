export class CustomError extends Error {
  private code: string;
  private statusCode: number;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "CustomError";

    switch (code) {
      case "USER_NOT_FOUND":
        this.statusCode = 404;
        break;
      case "INVALID_TELEGRAM_ID":
      case "WALLET_TYPE_CONFLICT":
        this.statusCode = 400;
        break;
      default:
        this.statusCode = 500;
    }
  }

  getCode(): string {
    return this.code;
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}
