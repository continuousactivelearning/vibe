/**
 * Error class for resource not found scenarios (404)
 */
export class NotFoundError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string = 'The requested resource was not found',
    details?: any,
  ) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
      ...(this.details && {details: this.details}),
    };
  }
}
export class HTTPError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly name: string,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}
