export type BoluoAgentKitErrorCode =
  | 'MISSING_OPENAPI_KEY'
  | 'INVALID_INPUT'
  | 'COMMAND_NOT_FOUND'
  | 'CONFIRMATION_REQUIRED'
  | 'SCHEMA_NOT_FOUND'
  | 'SCHEMA_UNRESOLVED_REFS'
  | 'JAVA_API_ERROR'
  | 'JAVA_RESPONSE_CONTRACT_ERROR'
  | 'UNKNOWN_ERROR';

export class BoluoAgentKitError extends Error {
  readonly code: BoluoAgentKitErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(
    code: BoluoAgentKitErrorCode,
    message: string,
    options: { cause?: unknown; status?: number } = {},
  ) {
    super(message);
    this.name = 'BoluoAgentKitError';
    this.code = code;
    this.status = options.status;
    this.cause = options.cause;
  }
}
