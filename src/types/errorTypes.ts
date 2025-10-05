// Error types
export class AuthError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = "AUTH_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AuthError";
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AuthError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends AuthError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
    this.name = "TooManyRequestsError";
  }
}
