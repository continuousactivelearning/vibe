import {HTTPError} from './http.error';

export class NotFoundError extends HTTPError {
  constructor(message = 'The requested resource was not found') {
    super(404, 'Not Found', message);
  }
}
