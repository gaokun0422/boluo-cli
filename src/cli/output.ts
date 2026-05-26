import { BoluoAgentKitError } from '../core/errors.js';

export type WriteLine = (text: string) => void;

type ValidationIssue = {
  message: string;
  path?: Array<PropertyKey>;
};

function formatIssuePath(path: Array<PropertyKey> | undefined): string {
  if (!path || path.length === 0) {
    return '';
  }

  return path
    .map((part) => (typeof part === 'number' ? `[${part}]` : String(part)))
    .join('.');
}

function getValidationDetails(
  cause: unknown,
): Array<{ message: string; path: string }> | undefined {
  if (
    !cause ||
    typeof cause !== 'object' ||
    !('issues' in cause) ||
    !Array.isArray(cause.issues)
  ) {
    return undefined;
  }

  const details = cause.issues
    .filter(
      (issue): issue is ValidationIssue =>
        !!issue &&
        typeof issue === 'object' &&
        'message' in issue &&
        typeof issue.message === 'string',
    )
    .map((issue) => ({
      path: formatIssuePath(issue.path),
      message: issue.message,
    }));

  return details.length > 0 ? details : undefined;
}

export function writeJsonSuccess(write: WriteLine, data: unknown): void {
  write(`${JSON.stringify({ ok: true, data }, null, 2)}\n`);
}

export function writeJsonError(write: WriteLine, error: unknown): void {
  if (error instanceof BoluoAgentKitError) {
    const details = getValidationDetails(error.cause);
    write(
      `${JSON.stringify(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            ...(error.status === undefined ? {} : { status: error.status }),
            ...(details === undefined ? {} : { details }),
          },
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  write(
    `${JSON.stringify(
      {
        ok: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : String(error),
        },
      },
      null,
      2,
    )}\n`,
  );
}
