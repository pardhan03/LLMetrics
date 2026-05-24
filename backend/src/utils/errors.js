export class AppError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR') {
        super(message);

        this.status = status;
        this.code = code;
    }
}

export class ProviderError extends AppError {
  constructor(
    message,
    status = 500,
    code = 'PROVIDER_ERROR',
    isRetryable = false
  ) {
    super(message, status, code);

    this.isRetryable = isRetryable;
  }
}