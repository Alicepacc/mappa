import { type ApiError, type ApiErrorCode } from '@mappa/shared';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  OUT_OF_COVERAGE: 422,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  UPSTREAM_UNAVAILABLE: 502,
  NOT_IMPLEMENTED: 501,
  INTERNAL: 500,
};

export class GatewayError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  toBody(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details === undefined ? {} : { details: this.details }),
      },
    };
  }
}

/** SPEC §1.0: waypoints outside the coverage get a friendly Italian message. */
export function outOfCoverage(details?: unknown): GatewayError {
  return new GatewayError('OUT_OF_COVERAGE', 'Fuori dall’area coperta dalla mappa', details);
}

export function badRequest(message: string, details?: unknown): GatewayError {
  return new GatewayError('BAD_REQUEST', message, details);
}

export function notImplemented(milestone: string): GatewayError {
  return new GatewayError('NOT_IMPLEMENTED', `Not implemented yet — scheduled for ${milestone}`);
}

export function statusForCode(code: ApiErrorCode): number {
  return STATUS_BY_CODE[code];
}
