import {
  Err as GenericErr,
  Ok as GenericOk,
  ResultAsync as GenericResultAsync,
  err as errOriginal,
  Result as GenericResult,
} from "neverthrow";

export {
  errOriginal,
  GenericErr,
  GenericOk,
  GenericResultAsync,
  GenericResult,
};
export * from "neverthrow";

export class Ok<T> extends GenericOk<T, Error> {}
export class Err<T> extends GenericErr<T, Error> {}
export class ResultAsync<T> extends GenericResultAsync<T, Error> {}
export type Result<T> = Ok<T> | Err<T>;
export namespace Result {
  export const fromThrowable = GenericResult.fromThrowable;
  export const fromAsyncThrowable = GenericResult.combine;
  export const combineWithAllErrors = GenericResult.combineWithAllErrors;
}

// Utility types
type ErrorInput = string | Error | unknown;

type FormattedError = {
  stack: string;
  cause?: FormattedError;
};

// Utility functions
function err<T>(error: ErrorInput, cause?: unknown): Err<T> {
  let baseError: Error;

  if (error instanceof Error) {
    baseError = error;
  } else if (typeof error === "string") {
    baseError = new Error(error);
  } else {
    baseError = new Error(JSON.stringify(error));
  }

  if (!(error instanceof Error)) {
    Error.captureStackTrace(baseError, err);
  }

  let formattedCause: Error | undefined;
  if (cause !== undefined) {
    if (cause instanceof Error) {
      formattedCause = cause;
    } else if (typeof cause === "string") {
      formattedCause = new Error(cause);
    } else {
      formattedCause = new Error(JSON.stringify(cause));
    }

    if (!(cause instanceof Error)) {
      Error.captureStackTrace(formattedCause, err);
    }
  }

  if (formattedCause) {
    baseError.cause = formattedCause;
  }

  return err(baseError);
}

function logFormat(error: Error | Err<unknown>): FormattedError {
  if (error instanceof Err) {
    return logFormat(error.error);
  }

  const formattedError: FormattedError = {
    stack: error.stack || "",
  };

  if (error.cause) {
    formattedError.cause = logFormat(error.cause as Error);
  }

  return formattedError;
}

export { err, logFormat };
export type { ErrorInput, FormattedError };
